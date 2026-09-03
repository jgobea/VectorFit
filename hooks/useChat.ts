import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { streamChatReply } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import type { ChatUIMessage } from '@/types/chat';

const HISTORY_LIMIT = 50;

// Network/CORS failures surface as an opaque "Failed to fetch" from the
// fetch API — not something to show a user. Everything else (Supabase
// errors, thrown Error messages) is already reasonably worded (and comes
// straight from Supabase/Gemini, so it isn't translated here).
function toFriendlyError(err: unknown, t: (key: string) => string): string {
  if (err instanceof TypeError && /fetch/i.test(err.message)) {
    return t('chat.networkError');
  }
  return err instanceof Error ? err.message : t('common.error');
}

export function useChat() {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const clearedAt = useChatStore((s) => s.clearedAt);
  const [messages, setMessages] = useState<ChatUIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data, error: loadError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(HISTORY_LIMIT);

    if (loadError) {
      setError(loadError.message);
      setIsLoading(false);
      return;
    }
    setError(null);
    setMessages(data ?? []);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    // Fetch-on-mount: `load` only sets state after its network call
    // resolves, so this isn't the synchronous-derived-state pattern the
    // react-hooks/set-state-in-effect rule targets — see hooks/useDashboard.ts.
    // Also re-fires on clearedAt changing — Chat stays mounted in the
    // background while Profile clears history, so this is the only signal
    // it gets that its already-loaded messages are gone.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, clearedAt]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || !userId || isSending) return;

      setError(null);
      setLastFailedMessage(null);
      setIsSending(true);

      const userMessage: ChatUIMessage = {
        id: `local-user-${Date.now()}`,
        user_id: userId,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      const assistantId = `local-assistant-${Date.now()}`;
      const history = [...messages, userMessage].map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: assistantId,
          user_id: userId,
          role: 'assistant',
          content: '',
          created_at: new Date().toISOString(),
          isStreaming: true,
        },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const { error: insertError } = await supabase
          .from('chat_messages')
          .insert({ user_id: userId, role: 'user', content });
        if (insertError) throw insertError;

        let fullReply = '';
        await streamChatReply(
          history,
          (chunk) => {
            fullReply += chunk;
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: fullReply } : m)));
          },
          controller.signal
        );

        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)));

        if (fullReply.trim()) {
          await supabase.from('chat_messages').insert({ user_id: userId, role: 'assistant', content: fullReply });
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(toFriendlyError(err, t));
        setLastFailedMessage(content);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsSending(false);
      }
    },
    [messages, userId, isSending, t]
  );

  const retry = useCallback(() => {
    if (lastFailedMessage) sendMessage(lastFailedMessage);
  }, [lastFailedMessage, sendMessage]);

  return { messages, isLoading, isSending, error, sendMessage, retry, canRetry: !!lastFailedMessage };
}
