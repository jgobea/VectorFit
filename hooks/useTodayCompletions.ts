import { useCallback, useEffect, useState } from 'react';

import { toLocalDateKey } from '@/lib/routineSchedule';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

// Which of today's routine exercises the user has already checked off —
// scoped to today's date, not the routine_exercise row itself, since a
// routine day recurs every week (see the migration comment).
export function useTodayCompletions() {
  const userId = useAuthStore((s) => s.user?.id);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('routine_exercise_completions')
      .select('routine_exercise_id')
      .eq('user_id', userId)
      .eq('completed_date', toLocalDateKey(new Date()));
    setCompletedIds(new Set((data ?? []).map((row) => row.routine_exercise_id)));
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const toggle = useCallback(
    async (routineExerciseId: string) => {
      if (!userId) return;
      const wasCompleted = completedIds.has(routineExerciseId);

      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (wasCompleted) next.delete(routineExerciseId);
        else next.add(routineExerciseId);
        return next;
      });

      if (wasCompleted) {
        await supabase
          .from('routine_exercise_completions')
          .delete()
          .eq('routine_exercise_id', routineExerciseId)
          .eq('completed_date', toLocalDateKey(new Date()));
      } else {
        await supabase
          .from('routine_exercise_completions')
          .insert({ user_id: userId, routine_exercise_id: routineExerciseId, completed_date: toLocalDateKey(new Date()) });
      }
    },
    [userId, completedIds]
  );

  // Unlike toggle, always marks done — never un-marks. Used when a timed
  // set (see ExerciseTimerModal) finishes, where "done" is the only
  // meaningful outcome.
  const complete = useCallback(
    async (routineExerciseId: string) => {
      if (!userId || completedIds.has(routineExerciseId)) return;
      setCompletedIds((prev) => new Set(prev).add(routineExerciseId));
      await supabase.from('routine_exercise_completions').upsert(
        { user_id: userId, routine_exercise_id: routineExerciseId, completed_date: toLocalDateKey(new Date()) },
        { onConflict: 'routine_exercise_id,completed_date' }
      );
    },
    [userId, completedIds]
  );

  return { completedIds, toggle, complete, isLoading, reload: load };
}
