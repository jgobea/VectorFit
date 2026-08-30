import { QuickPoseThresholdCounter } from '@quickpose/react-native';
import type { QuickPoseUpdateEvent } from '@quickpose/react-native';
import { useCallback, useRef, useState } from 'react';

import { toLocalDateKey } from '@/lib/routineSchedule';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Exercise } from '@/types/workout';

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
  const counterRef = useRef(new QuickPoseThresholdCounter());
  const setTalliesRef = useRef<SetTally[]>([]);
  const scoresRef = useRef<number[]>([]);
  const feedbacksRef = useRef<Set<string>>(new Set());
  // Captured once at mount (session start), not at insert time — `started_at`
  // otherwise defaults to `now()` in the DB, which lands within milliseconds
  // of `ended_at` and makes every session's duration read as ~0.
  const startedAtRef = useRef(new Date().toISOString());

  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState(0);
  const [formScore, setFormScore] = useState(0);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

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
          if (state.type === 'poseComplete') setReps(state.count);
        });
      }

      setFeedbackText(feedbacks[featureKey] ?? null);
      if (feedbacks[featureKey]) feedbacksRef.current.add(feedbacks[featureKey]);
    },
    [featureKey, isPaused]
  );

  // Archives the current set's tally and resets per-set counters — called
  // when the user taps "Finish Set" before the last set. Feedback history
  // is aggregated across the whole workout, not reset here.
  const finishSet = useCallback(() => {
    setTalliesRef.current.push({ reps, scores: scoresRef.current });
    counterRef.current.reset();
    scoresRef.current = [];
    setReps(0);
    setFormScore(0);
    setCurrentSet((s) => s + 1);
  }, [reps]);

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
  }, [buildSummary, config.exercise.id, config.routineExerciseId, config.targetReps, config.totalSets, userId]);

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
    onUpdate,
    finishSet,
    finishWorkout,
  };
}
