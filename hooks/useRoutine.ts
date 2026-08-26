import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useRoutineStore } from '@/stores/routineStore';
import type { Routine } from '@/types/routine';

const ROUTINE_SELECT = `
  *,
  days:routine_days (
    *,
    exercises:routine_exercises ( *, exercise:exercises (*) )
  )
`;

function sortRoutine(routine: Routine): Routine {
  return {
    ...routine,
    days: [...routine.days]
      .sort((a, b) => a.day_of_week - b.day_of_week)
      .map((day) => ({
        ...day,
        exercises: [...day.exercises].sort((a, b) => a.order_index - b.order_index),
      })),
  };
}

// Loads the user's single routine (see supabase/migrations/20260826000000_routines.sql
// for the one-routine-per-user constraint). `createIfMissing` is used by the
// builder screen only — the Dashboard just wants to know whether one exists,
// to decide between the empty state and the Today's/Upcoming sections.
export function useRoutine({ createIfMissing = false }: { createIfMissing?: boolean } = {}) {
  const userId = useAuthStore((s) => s.user?.id);
  const routine = useRoutineStore((s) => s.routine);
  const setRoutine = useRoutineStore((s) => s.setRoutine);
  const isLoading = useRoutineStore((s) => s.isLoading);
  const setLoading = useRoutineStore((s) => s.setLoading);
  const error = useRoutineStore((s) => s.error);
  const setError = useRoutineStore((s) => s.setError);
  const [isCreating, setIsCreating] = useState(false);

  const createRoutine = useCallback(async () => {
    if (!userId) return;
    setIsCreating(true);

    const { data: newRoutine, error: routineError } = await supabase
      .from('routines')
      .insert({ user_id: userId, name: 'My Routine' })
      .select('*')
      .single();

    if (routineError || !newRoutine) {
      setError(routineError?.message ?? 'Failed to create routine');
      setIsCreating(false);
      return;
    }

    const dayRows = Array.from({ length: 7 }, (_, day_of_week) => ({ routine_id: newRoutine.id, day_of_week }));
    const { data: days, error: daysError } = await supabase.from('routine_days').insert(dayRows).select('*');

    setIsCreating(false);

    if (daysError) {
      setError(daysError.message);
      return;
    }

    setError(null);
    setRoutine(sortRoutine({ ...newRoutine, days: (days ?? []).map((d) => ({ ...d, exercises: [] })) }));
  }, [userId, setRoutine, setError]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data, error: loadError } = await supabase
      .from('routines')
      .select(ROUTINE_SELECT)
      .eq('user_id', userId)
      .maybeSingle();

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setError(null);
    if (data) {
      setRoutine(sortRoutine(data as unknown as Routine));
      setLoading(false);
    } else if (createIfMissing) {
      await createRoutine();
      setLoading(false);
    } else {
      setRoutine(null);
      setLoading(false);
    }
    // createIfMissing/createRoutine intentionally excluded: this should only
    // re-run when the signed-in user changes, not when the callback identity
    // changes on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, setRoutine, setLoading, setError]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { routine, isLoading: isLoading || isCreating, error, reload: load, createRoutine };
}
