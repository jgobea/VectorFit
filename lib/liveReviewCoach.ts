import { fetch } from 'expo/fetch';

import { supabase } from './supabase';

export interface FeedbackCount {
  text: string;
  count: number;
}

export interface SetCoachRequest {
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  repsCompleted: number;
  targetReps: number;
  feedbackCounts: FeedbackCount[];
  previousSetFeedbackCounts: FeedbackCount[] | null;
  /** True when there's no next set coming (last set finished, or an early
   * Stop) — the note shouldn't talk about "your next set" in that case. */
  isWorkoutComplete: boolean;
}

// Short between-set coaching note from supabase/functions/live-review-feedback
// — same auth pattern as lib/gemini.ts's streamChatReply, but a single JSON
// response instead of a stream (the reply is short enough that streaming
// isn't worth the extra client complexity).
export async function fetchSetCoachFeedback(request: SetCoachRequest, signal?: AbortSignal): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/live-review-feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Coach feedback request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { message?: string };
  return data.message ?? '';
}
