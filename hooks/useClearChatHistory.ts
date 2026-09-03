import { useCallback, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useChatStore } from '@/stores/chatStore';

// Privacy Settings' "Clear Chat History" action — deletes chat_messages
// rows without touching the rest of the account (delete-account is the
// separate, full-account destructive action).
export function useClearChatHistory(userId: string | undefined) {
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signalCleared = useChatStore((s) => s.signalCleared);

  const clearChatHistory = useCallback(async () => {
    if (!userId) return false;
    setIsClearing(true);
    setError(null);
    const { error: deleteError } = await supabase.from('chat_messages').delete().eq('user_id', userId);
    setIsClearing(false);
    if (deleteError) {
      setError(deleteError.message);
      return false;
    }
    // Chat's own useChat() instance stays mounted in the background (it's
    // a Tabs.Screen) and has no other way to learn its already-loaded
    // messages were just deleted — this makes it re-fetch immediately
    // instead of staying stale until the app restarts.
    signalCleared();
    return true;
  }, [userId, signalCleared]);

  return { clearChatHistory, isClearing, error };
}
