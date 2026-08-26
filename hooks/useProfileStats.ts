import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { PersonalRecord, ProfileStats } from '@/types/profileStats';

const RECORD_LIMIT = 5;

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

// Longest-ever run of consecutive calendar days with a completed session —
// distinct from useDashboardStats' computeStreak, which is the *current*
// streak ending today/yesterday only.
function computeLongestStreak(sessionDates: string[]): number {
  const days = Array.from(new Set(sessionDates.map(toDateKey))).sort();
  if (days.length === 0) return 0;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const dayDiff = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
    current = dayDiff === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

interface PoseSessionRow {
  exercise_id: string;
  best_rep_score: number | null;
  exercise: { name: string } | { name: string }[] | null;
}

function bestPerExercise(rows: PoseSessionRow[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>();
  for (const row of rows) {
    if (row.best_rep_score == null) continue;
    const existing = best.get(row.exercise_id);
    if (existing && existing.bestRepScore >= row.best_rep_score) continue;
    const exerciseName = Array.isArray(row.exercise) ? row.exercise[0]?.name : row.exercise?.name;
    best.set(row.exercise_id, {
      exerciseId: row.exercise_id,
      exerciseName: exerciseName ?? 'Unknown exercise',
      bestRepScore: row.best_rep_score,
    });
  }
  return Array.from(best.values())
    .sort((a, b) => b.bestRepScore - a.bestRepScore)
    .slice(0, RECORD_LIMIT);
}

export function useProfileStats(userId: string | undefined) {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    const [sessions, poseSessions] = await Promise.all([
      supabase
        .from('workout_sessions')
        .select('started_at, duration_seconds')
        .eq('user_id', userId)
        .eq('status', 'completed'),
      supabase
        .from('pose_sessions')
        .select('exercise_id, best_rep_score, exercise:exercises(name)')
        .eq('user_id', userId)
        .not('best_rep_score', 'is', null)
        .order('best_rep_score', { ascending: false })
        .limit(100),
    ]);

    const completedSessions = sessions.data ?? [];

    setStats({
      totalWorkouts: completedSessions.length,
      totalHours: Math.round((completedSessions.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) / 3600) * 10) / 10,
      longestStreakDays: computeLongestStreak(completedSessions.map((s) => s.started_at)),
      personalRecords: bestPerExercise((poseSessions.data as PoseSessionRow[] | null) ?? []),
    });
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { stats, isLoading };
}
