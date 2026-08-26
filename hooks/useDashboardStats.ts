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

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Streak = consecutive calendar days (ending today or yesterday) with a
// confirmed routine_day_completions row.
function computeStreak(completedDates: string[]): number {
  const days = new Set(completedDates);
  const cursor = new Date();
  if (!days.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(toDateKey(cursor))) {
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

    const weekStartKey = toDateKey(startOfWeek(new Date()));

    const [weekCompletions, recentCompletions, bestForm] = await Promise.all([
      supabase
        .from('routine_day_completions')
        .select('completed_date')
        .eq('user_id', userId)
        .gte('completed_date', weekStartKey),
      supabase
        .from('routine_day_completions')
        .select('completed_date')
        .eq('user_id', userId)
        .order('completed_date', { ascending: false })
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
      workoutsThisWeek: weekCompletions.data?.length ?? 0,
      streakDays: computeStreak((recentCompletions.data ?? []).map((s) => s.completed_date)),
      personalBestFormScore: bestForm.data?.best_rep_score ?? null,
    });
    setIsLoading(false);
  }, [userId]);

  return { stats, isLoading, load };
}
