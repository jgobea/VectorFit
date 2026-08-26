import { useCallback, useEffect, useState } from 'react';

import { toLocalDateKey } from '@/lib/routineSchedule';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

interface CompleteDayParams {
  routineId: string;
  exerciseCount: number;
  totalLoadKg: number | null;
}

// Whether today's whole routine day has already been confirmed finished —
// gates TodaysRoutineSection's Finish Day button vs. its "Day Complete"
// state.
export function useTodayDayCompletion() {
  const userId = useAuthStore((s) => s.user?.id);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('routine_day_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('completed_date', toLocalDateKey(new Date()))
      .maybeSingle();
    setIsComplete(!!data);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const complete = useCallback(
    async ({ routineId, exerciseCount, totalLoadKg }: CompleteDayParams) => {
      if (!userId) return false;
      const { error } = await supabase.from('routine_day_completions').insert({
        user_id: userId,
        routine_id: routineId,
        completed_date: toLocalDateKey(new Date()),
        exercise_count: exerciseCount,
        total_load_kg: totalLoadKg,
      });
      if (error) return false;
      setIsComplete(true);
      return true;
    },
    [userId]
  );

  return { isComplete, isLoading, complete, reload: load };
}
