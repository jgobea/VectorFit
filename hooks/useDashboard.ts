import { useCallback, useEffect, useState } from 'react';

import { useDashboardStats } from '@/hooks/useDashboardStats';
import { getTimeBasedGreeting, getMotivationalQuote } from '@/lib/greeting';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useWorkoutStore } from '@/stores/workoutStore';

const WORKOUT_EXERCISES_SELECT = `
  *,
  exercises:workout_exercises (
    id, order_index, sets, reps, duration_seconds,
    exercise:exercises ( id, name, difficulty, image_url )
  )
`;

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function useDashboard() {
  const userId = useAuthStore((s) => s.user?.id);
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const todaysWorkouts = useWorkoutStore((s) => s.todaysWorkouts);
  const upcomingWorkouts = useWorkoutStore((s) => s.upcomingWorkouts);
  const setTodaysWorkouts = useWorkoutStore((s) => s.setTodaysWorkouts);
  const setUpcomingWorkouts = useWorkoutStore((s) => s.setUpcomingWorkouts);

  const { stats, load: loadStats } = useDashboardStats(userId);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;

    const today = new Date();
    const weekOut = new Date(today);
    weekOut.setDate(weekOut.getDate() + 6);

    const [profileRes, todayRes, upcomingRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase
        .from('workouts')
        .select(WORKOUT_EXERCISES_SELECT)
        .eq('user_id', userId)
        .eq('scheduled_date', toLocalDateKey(today)),
      supabase
        .from('workouts')
        .select(WORKOUT_EXERCISES_SELECT)
        .eq('user_id', userId)
        .gt('scheduled_date', toLocalDateKey(today))
        .lte('scheduled_date', toLocalDateKey(weekOut))
        .order('scheduled_date', { ascending: true }),
      loadStats(),
    ]);

    if (profileRes.error || todayRes.error || upcomingRes.error) {
      setError(profileRes.error?.message ?? todayRes.error?.message ?? upcomingRes.error?.message ?? 'Failed to load');
      return;
    }

    setError(null);
    setProfile(profileRes.data);
    setTodaysWorkouts(todayRes.data ?? []);
    setUpcomingWorkouts(upcomingRes.data ?? []);
  }, [userId, loadStats, setProfile, setTodaysWorkouts, setUpcomingWorkouts]);

  useEffect(() => {
    // Fetch-on-mount: `load` is async and only sets state after its network
    // calls resolve, so this isn't the synchronous-derived-state pattern the
    // rule targets — React's own effect docs list data fetching as a valid
    // effect use case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }, [load]);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  return {
    greeting: `${getTimeBasedGreeting()}, ${firstName}!`,
    quote: getMotivationalQuote(),
    profile,
    todaysWorkouts,
    upcomingWorkouts,
    stats,
    isRefreshing,
    onRefresh,
    error,
  };
}
