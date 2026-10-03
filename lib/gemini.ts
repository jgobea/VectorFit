import { i18next } from '@/lib/i18n';
import { offlineChatReply, type CoachLang } from '@/lib/offlineCoach';
import { useUserStore } from '@/stores/userStore';

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}

function coachLanguage(): CoachLang {
  const preferred = useUserStore.getState().profile?.language_preference ?? i18next.language;
  return preferred === 'es' ? 'es' : 'en';
}

// OFFLINE BUILD: no Gemini, no Edge Function. Replies come from
// lib/offlineCoach.ts and are streamed in small chunks so the chat UI keeps
// its typing effect.
export async function streamChatReply(
  messages: ChatMessagePayload[],
  onChunk: (textChunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const reply = offlineChatReply(lastUser?.content ?? '', coachLanguage());

  await new Promise((resolve) => setTimeout(resolve, 400));
  for (let i = 0; i < reply.length; i += 6) {
    if (signal?.aborted) return;
    onChunk(reply.slice(i, i + 6));
    await new Promise((resolve) => setTimeout(resolve, 15));
  }
}
