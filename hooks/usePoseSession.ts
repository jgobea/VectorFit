import { QuickPoseThresholdCounter } from '@quickpose/react-native';
import type { QuickPoseUpdateEvent } from '@quickpose/react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchSetCoachFeedback, type FeedbackCount } from '@/lib/liveReviewCoach';
import { toLocalDateKey } from '@/lib/routineSchedule';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import type { Exercise } from '@/types/workout';

// BCP-47 locale codes expo-speech expects — keyed the same as
// supabase/functions/chat/index.ts's LANGUAGE_NAMES / users.language_preference.
const SPEECH_LANGUAGE_CODES: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
};

// Top N distinct form corrections by how often they fired this set — what
// actually goes to the coach-feedback edge function. The raw form score
// isn't a quality signal (it's a range-of-motion sweep tied to rep
// counting, see supabase/functions/live-review-feedback/index.ts's comment),
// so these frequency counts are the only real per-rep quality signal to
// hand off.
function topFeedbackCounts(counts: Map<string, number>, limit = 5): FeedbackCount[] {
  return Array.from(counts.entries())
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface SessionConfig {
  exercise: Exercise;
  targetReps: number;
  totalSets: number;
  restSeconds: number;
  /** Set when this session was started from Today's Workout's camera
   * button — finishing the workout marks that routine exercise done for
   * today, same as the manual check does for non-Live-Review exercises. */
  routineExerciseId?: string;
}

export interface LiveReviewSummary {
  totalReps: number;
  avgFormScore: number | null;
  bestRepScore: number | null;
  feedbackSummary: string | null;
  setsCompleted: number;
}

interface SetTally {
  reps: number;
  scores: number[];
}

// Owns the QuickPose result stream across an entire multi-set workout: rep
// counting per set (via the SDK's own threshold state machine), the running
// form score, the latest feedback cue, and persisting the finished workout
// to `pose_sessions`. `targetReps` is a threshold that tells the UI when to
// offer "finish set" — counting doesn't stop there, so training to failure
// past the target still gets an accurate rep count.
export function usePoseSession(config: SessionConfig) {
  const userId = useAuthStore((s) => s.user?.id);
  // Whatever's already in the store from Dashboard/Profile loading it —
  // not re-fetched here. If it hasn't loaded yet (unlikely, Live Review is
  // never the first screen after login), voice feedback just stays off for
  // this session instead of blocking on a fresh query.
  const voiceProfile = useUserStore((s) => s.profile);
  // Short "ding" played on every counted rep — see the poseComplete branch
  // in onUpdate below. require(...) needs a static, relative (not @/-alias)
  // path for Metro's asset plugin to pick it up.
  const repSoundPlayer = useAudioPlayer(require('../assets/sounds/rep_beep.wav'));
  const counterRef = useRef(new QuickPoseThresholdCounter());
  const setTalliesRef = useRef<SetTally[]>([]);
  const scoresRef = useRef<number[]>([]);
  const feedbacksRef = useRef<Set<string>>(new Set());
  // Per-set frequency of each distinct feedback string — reset every set,
  // fed to the coach-feedback edge function (see finishSet below). Separate
  // from feedbacksRef above, which is whole-workout and only tracks
  // distinct text for the final summary, not counts.
  const currentSetFeedbackCountsRef = useRef<Map<string, number>>(new Map());
  const previousSetFeedbackCountsRef = useRef<FeedbackCount[] | null>(null);
  const coachAbortRef = useRef<AbortController | null>(null);
  // Captured once at mount (session start), not at insert time — `started_at`
  // otherwise defaults to `now()` in the DB, which lands within milliseconds
  // of `ended_at` and makes every session's duration read as ~0.
  const startedAtRef = useRef(new Date().toISOString());

  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState(0);
  const [formScore, setFormScore] = useState(0);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState<string | null>(null);
  const [isFetchingCoachFeedback, setIsFetchingCoachFeedback] = useState(false);

  useEffect(() => {
    return () => {
      coachAbortRef.current?.abort();
      Speech.stop();
    };
  }, []);

  // Speaks each new coach note once, if the user has voice feedback turned
  // on in Profile — those settings (users.ai_voice_feedback_enabled /
  // ai_voice_volume) existed in the schema from the start but had nothing
  // wired to them until now.
  useEffect(() => {
    if (!coachFeedback || !voiceProfile?.ai_voice_feedback_enabled) return;
    const language = voiceProfile.language_preference
      ? SPEECH_LANGUAGE_CODES[voiceProfile.language_preference]
      : undefined;
    Speech.speak(coachFeedback, { language, volume: (voiceProfile.ai_voice_volume ?? 70) / 100 });
  }, [coachFeedback, voiceProfile?.ai_voice_feedback_enabled, voiceProfile?.ai_voice_volume, voiceProfile?.language_preference]);

  const featureKey = config.exercise.quickpose_feature ?? '';
  const isSetComplete = reps >= config.targetReps;
  const isLastSet = currentSet >= config.totalSets;

  const onUpdate = useCallback(
    (event: QuickPoseUpdateEvent) => {
      if (isPaused || !featureKey) return;
      const { results, feedbacks } = event.nativeEvent;

      const value = results[featureKey];
      if (typeof value === 'number') {
        const score = Math.round(value * 100);
        setFormScore(score);
        scoresRef.current.push(score);
        counterRef.current.count(value, (state) => {
          if (state.type === 'poseComplete') {
            setReps(state.count);
            repSoundPlayer.seekTo(0);
            repSoundPlayer.play();
          }
        });
      }

      const feedback = feedbacks[featureKey];
      setFeedbackText(feedback ?? null);
      if (feedback) {
        feedbacksRef.current.add(feedback);
        const counts = currentSetFeedbackCountsRef.current;
        counts.set(feedback, (counts.get(feedback) ?? 0) + 1);
      }
    },
    [featureKey, isPaused, repSoundPlayer]
  );

  // Fire-and-forget: requests a short coaching note for the set that just
  // finished, shown during the rest period. Never blocks finishSet — a
  // slow/failed request just means no note appears, the rest timer doesn't
  // wait on it.
  const requestCoachFeedback = useCallback(
    (setNumber: number, repsCompleted: number, feedbackCounts: FeedbackCount[], isWorkoutComplete: boolean) => {
      coachAbortRef.current?.abort();
      const controller = new AbortController();
      coachAbortRef.current = controller;

      Speech.stop();
      setCoachFeedback(null);
      setIsFetchingCoachFeedback(true);

      fetchSetCoachFeedback(
        {
          exerciseName: config.exercise.name,
          setNumber,
          totalSets: config.totalSets,
          repsCompleted,
          targetReps: config.targetReps,
          feedbackCounts,
          previousSetFeedbackCounts: previousSetFeedbackCountsRef.current,
          isWorkoutComplete,
        },
        controller.signal
      )
        .then((message) => {
          if (controller.signal.aborted) return;
          setCoachFeedback(message || null);
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          console.error('Failed to fetch Live Review coach feedback:', err);
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          setIsFetchingCoachFeedback(false);
        });

      previousSetFeedbackCountsRef.current = feedbackCounts;
    },
    [config.exercise.name, config.targetReps, config.totalSets]
  );

  // Archives the current set's tally and resets per-set counters — called
  // when the user taps "Finish Set" before the last set. Feedback history
  // is aggregated across the whole workout, not reset here.
  const finishSet = useCallback(() => {
    setTalliesRef.current.push({ reps, scores: scoresRef.current });
    if (reps > 0) {
      requestCoachFeedback(currentSet, reps, topFeedbackCounts(currentSetFeedbackCountsRef.current), false);
    }
    currentSetFeedbackCountsRef.current = new Map();
    counterRef.current.reset();
    scoresRef.current = [];
    setReps(0);
    setFormScore(0);
    setCurrentSet((s) => s + 1);
  }, [currentSet, reps, requestCoachFeedback]);

  const buildSummary = useCallback((): LiveReviewSummary => {
    // Include whatever's in progress — covers an early Stop mid-set.
    const tallies = [...setTalliesRef.current];
    if (reps > 0 || scoresRef.current.length > 0) {
      tallies.push({ reps, scores: scoresRef.current });
    }
    const totalReps = tallies.reduce((sum, t) => sum + t.reps, 0);
    const allScores = tallies.flatMap((t) => t.scores);
    return {
      totalReps,
      avgFormScore: allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null,
      bestRepScore: allScores.length ? Math.max(...allScores) : null,
      feedbackSummary: feedbacksRef.current.size ? Array.from(feedbacksRef.current).join('; ') : null,
      setsCompleted: tallies.length,
    };
  }, [reps]);

  const finishWorkout = useCallback(async (): Promise<LiveReviewSummary> => {
    const summary = buildSummary();

    // finishSet (and the coach note it requests) only runs between sets —
    // a single-set exercise, or the workout's actual last set, never goes
    // through a rest period, so it never got a request otherwise. This
    // covers both cases, plus an early Stop, uniformly.
    if (reps > 0) {
      requestCoachFeedback(currentSet, reps, topFeedbackCounts(currentSetFeedbackCountsRef.current), true);
    }

    if (userId) {
      const { error } = await supabase.from('pose_sessions').insert({
        user_id: userId,
        exercise_id: config.exercise.id,
        started_at: startedAtRef.current,
        ended_at: new Date().toISOString(),
        total_reps: summary.totalReps,
        target_reps: config.targetReps * config.totalSets,
        avg_form_score: summary.avgFormScore,
        best_rep_score: summary.bestRepScore,
        feedback_summary: summary.feedbackSummary,
      });
      if (error) console.error('Failed to save pose session:', error);

      if (config.routineExerciseId) {
        const { error: completionError } = await supabase.from('routine_exercise_completions').upsert(
          {
            user_id: userId,
            routine_exercise_id: config.routineExerciseId,
            completed_date: toLocalDateKey(new Date()),
          },
          { onConflict: 'routine_exercise_id,completed_date' }
        );
        if (completionError) console.error('Failed to mark routine exercise complete:', completionError);
      }
    }

    return summary;
  }, [
    buildSummary,
    config.exercise.id,
    config.routineExerciseId,
    config.targetReps,
    config.totalSets,
    currentSet,
    reps,
    requestCoachFeedback,
    userId,
  ]);

  return {
    currentSet,
    totalSets: config.totalSets,
    targetReps: config.targetReps,
    reps,
    formScore,
    feedbackText,
    isPaused,
    setIsPaused,
    isSetComplete,
    isLastSet,
    coachFeedback,
    isFetchingCoachFeedback,
    onUpdate,
    finishSet,
    finishWorkout,
  };
}
