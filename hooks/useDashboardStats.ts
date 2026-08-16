import { useCallback, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { DashboardStats } from '@/types/dashboard';

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

// Streak = consecutive calendar days (ending today or yesterday) with at
// least one completed workout_session.
function computeStreak(sessionDates: string[]): number {
  const days = new Set(sessionDates.map(toDateKey));
  const cursor = new Date();
  if (!days.has(toDateKey(cursor.toISOString()))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(toDateKey(cursor.toISOString()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function useDashboardStats(userId: string | undefined) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    const weekStart = startOfWeek(new Date()).toISOString();

    const [weekSessions, allCompletedDates, bestForm] = await Promise.all([
      supabase
        .from('workout_sessions')
        .select('calories_burned')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('started_at', weekStart),
      supabase
        .from('workout_sessions')
        .select('started_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(60),
      supabase
        .from('pose_sessions')
        .select('best_rep_score')
        .eq('user_id', userId)
        .order('best_rep_score', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    setStats({
      workoutsThisWeek: weekSessions.data?.length ?? 0,
      caloriesBurned: (weekSessions.data ?? []).reduce((sum, s) => sum + (s.calories_burned ?? 0), 0),
      streakDays: computeStreak((allCompletedDates.data ?? []).map((s) => s.started_at)),
      personalBestFormScore: bestForm.data?.best_rep_score ?? null,
    });
    setIsLoading(false);
  }, [userId]);

  return { stats, isLoading, load };
}
