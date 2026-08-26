import { useCallback, useEffect, useState } from 'react';

import { useDashboardStats } from '@/hooks/useDashboardStats';
import { getTimeBasedGreeting, getMotivationalQuote } from '@/lib/greeting';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';

export function useDashboard() {
  const userId = useAuthStore((s) => s.user?.id);
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);

  const { stats, load: loadStats } = useDashboardStats(userId);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;

    const [profileRes] = await Promise.all([supabase.from('users').select('*').eq('id', userId).single(), loadStats()]);

    if (profileRes.error) {
      setError(profileRes.error.message);
      return;
    }

    setError(null);
    setProfile(profileRes.data);
  }, [userId, loadStats, setProfile]);

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
    stats,
    isRefreshing,
    onRefresh,
    error,
  };
}
