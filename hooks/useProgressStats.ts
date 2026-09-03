import { useCallback, useEffect, useState } from 'react';

import { toLocalDateKey } from '@/lib/routineSchedule';
import { supabase } from '@/lib/supabase';
import type { CategorySlice, DayActivity, ProgressStats, WeeklyCount, WeeklyScore } from '@/types/progressStats';

const WEEKS_BACK = 8;
const DAYS_BACK = 14;

// Same body-area taxonomy as supabase/migrations/20260825140000_categorize_exercises.sql
// and ExercisePickerModal's 'Other' fallback for uncategorized/custom exercises.
const CATEGORY_ORDER = ['Upper Body', 'Lower Body', 'Core', 'Full Body'];
const UNCATEGORIZED = 'Other';

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// "M/D" rather than "Aug 24" — with 8 weeks on screen at once, the fuller
// label doesn't fit the narrow per-bar column gifted-charts allots to each
// x-axis label and gets truncated to "Aug...".
function weekLabel(start: Date): string {
  return `${start.getMonth() + 1}/${start.getDate()}`;
}

// Current streak = consecutive calendar days (ending today or yesterday)
// with a completed routine day — same definition as useDashboardStats.
function computeCurrentStreak(dateKeys: Set<string>): number {
  const cursor = new Date();
  if (!dateKeys.has(toLocalDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (dateKeys.has(toLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Longest-ever run of consecutive days — same definition as useProfileStats.
function computeLongestStreak(sortedKeys: string[]): number {
  if (sortedKeys.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sortedKeys.length; i++) {
    const dayDiff = Math.round((new Date(sortedKeys[i]).getTime() - new Date(sortedKeys[i - 1]).getTime()) / 86_400_000);
    current = dayDiff === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

interface PoseSessionRow {
  started_at: string;
  ended_at: string | null;
  avg_form_score: number | null;
  exercise: { category: string | null } | { category: string | null }[] | null;
}

export function useProgressStats(userId: string | undefined) {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    const [dayCompletions, poseSessions] = await Promise.all([
      supabase.from('routine_day_completions').select('completed_date').eq('user_id', userId),
      supabase
        .from('pose_sessions')
        .select('started_at, ended_at, avg_form_score, exercise:exercises(category)')
        .eq('user_id', userId),
    ]);

    const completionKeys = (dayCompletions.data ?? []).map((c) => c.completed_date);
    const completionSet = new Set(completionKeys);
    const sortedKeys = [...completionKeys].sort();
    const sessions = (poseSessions.data as PoseSessionRow[] | null) ?? [];

    const totalSeconds = sessions.reduce((sum, s) => {
      if (!s.ended_at) return sum;
      return sum + Math.max(0, (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000);
    }, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last14Days: DayActivity[] = [];
    for (let i = DAYS_BACK - 1; i >= 0; i--) {
      const date = addDays(today, -i);
      const key = toLocalDateKey(date);
      last14Days.push({
        dateKey: key,
        dayOfWeek: date.getDay(),
        active: completionSet.has(key),
        isToday: i === 0,
      });
    }

    const thisWeekStart = startOfWeek(today);
    const weeklyWorkouts: WeeklyCount[] = [];
    const weeklyFormScore: WeeklyScore[] = [];
    for (let w = WEEKS_BACK - 1; w >= 0; w--) {
      const weekStart = addDays(thisWeekStart, -7 * w);
      const weekEnd = addDays(weekStart, 7);
      const weekStartKey = toLocalDateKey(weekStart);
      const weekEndKey = toLocalDateKey(weekEnd);
      const label = weekLabel(weekStart);

      const count = completionKeys.filter((k) => k >= weekStartKey && k < weekEndKey).length;
      weeklyWorkouts.push({ weekLabel: label, count });

      const weekSessions = sessions.filter((s) => {
        if (s.avg_form_score == null) return false;
        const started = new Date(s.started_at);
        return started >= weekStart && started < weekEnd;
      });
      // Omitted (not zeroed) when a week has no sessions — a 0 would read as
      // "scored zero" rather than "didn't train," which is misleading on a
      // form-score trend line.
      if (weekSessions.length > 0) {
        const avg = weekSessions.reduce((sum, s) => sum + (s.avg_form_score ?? 0), 0) / weekSessions.length;
        weeklyFormScore.push({ weekLabel: label, avgFormScore: Math.round(avg) });
      }
    }

    const categoryCounts = new Map<string, number>();
    for (const s of sessions) {
      const cat = Array.isArray(s.exercise) ? s.exercise[0]?.category : s.exercise?.category;
      const key = cat ?? UNCATEGORIZED;
      categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
    }
    const categoryBreakdown: CategorySlice[] = Array.from(categoryCounts.entries())
      .map(([category, sessionCount]) => ({ category, sessionCount }))
      .sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a.category);
        const bi = CATEGORY_ORDER.indexOf(b.category);
        if (ai === -1 && bi === -1) return b.sessionCount - a.sessionCount;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });

    setStats({
      totalWorkouts: sortedKeys.length,
      totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
      currentStreakDays: computeCurrentStreak(completionSet),
      longestStreakDays: computeLongestStreak(sortedKeys),
      last14Days,
      weeklyWorkouts,
      weeklyFormScore,
      categoryBreakdown,
    });
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { stats, isLoading };
}
