import { fetch } from 'expo/fetch';

import { supabase } from './supabase';

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}

// The Gemini API key never reaches the client: this only streams the
// response from supabase/functions/chat, which is where the actual
// @google/generative-ai calls happen.
export async function streamChatReply(
  messages: ChatMessagePayload[],
  onChunk: (textChunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}
