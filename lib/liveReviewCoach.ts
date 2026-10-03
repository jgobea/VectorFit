import { i18next } from '@/lib/i18n';
import { offlineSetNote, type CoachLang } from '@/lib/offlineCoach';
import { useUserStore } from '@/stores/userStore';

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

// OFFLINE BUILD: the between-set note is generated locally by
// lib/offlineCoach.ts instead of the live-review-feedback Edge Function.
export async function fetchSetCoachFeedback(request: SetCoachRequest, _signal?: AbortSignal): Promise<string> {
  const preferred = useUserStore.getState().profile?.language_preference ?? i18next.language;
  const lang: CoachLang = preferred === 'es' ? 'es' : 'en';
  return offlineSetNote(request, lang);
}
