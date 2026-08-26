import { useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { useRoutineStore } from '@/stores/routineStore';

// Day-level mutations for the routine builder: rename, rest/training
// toggle, notes, clear, and copy-to-other-days. All optimistic — the store
// patches immediately, the Supabase write happens after.
export function useRoutineDayActions() {
  const routine = useRoutineStore((s) => s.routine);
  const patchRoutine = useRoutineStore((s) => s.patchRoutine);
  const patchDay = useRoutineStore((s) => s.patchDay);
  const setDayExercises = useRoutineStore((s) => s.setDayExercises);

  const updateName = useCallback(
    async (name: string) => {
      if (!routine) return;
      patchRoutine({ name });
      await supabase.from('routines').update({ name }).eq('id', routine.id);
    },
    [routine, patchRoutine]
  );

  const setDayRestStatus = useCallback(
    async (dayId: string, isRestDay: boolean) => {
      patchDay(dayId, { is_rest_day: isRestDay });
      await supabase.from('routine_days').update({ is_rest_day: isRestDay }).eq('id', dayId);
    },
    [patchDay]
  );

  const setDayNotes = useCallback(
    async (dayId: string, notes: string) => {
      patchDay(dayId, { notes });
      await supabase.from('routine_days').update({ notes }).eq('id', dayId);
    },
    [patchDay]
  );

  const clearDay = useCallback(
    async (dayId: string) => {
      setDayExercises(dayId, []);
      await supabase.from('routine_exercises').delete().eq('routine_day_id', dayId);
    },
    [setDayExercises]
  );

  // Overwrites each target day's rest status, notes, and exercises with the
  // source day's — explicit replace, not merge (kept simple per the user's
  // "keep it simple" steer on the data model).
  const copyDay = useCallback(
    async (sourceDayId: string, targetDayIds: string[]) => {
      if (!routine) return;
      const source = routine.days.find((d) => d.id === sourceDayId);
      if (!source) return;

      for (const targetId of targetDayIds) {
        patchDay(targetId, { is_rest_day: source.is_rest_day, notes: source.notes });

        await supabase
          .from('routine_days')
          .update({ is_rest_day: source.is_rest_day, notes: source.notes })
          .eq('id', targetId);
        await supabase.from('routine_exercises').delete().eq('routine_day_id', targetId);

        if (source.exercises.length === 0) {
          setDayExercises(targetId, []);
          continue;
        }

        const rows = source.exercises.map((e) => ({
          routine_day_id: targetId,
          exercise_id: e.exercise_id,
          order_index: e.order_index,
          sets: e.sets,
          reps: e.reps,
          weight_kg: e.weight_kg,
          duration_seconds: e.duration_seconds,
          rest_seconds: e.rest_seconds,
        }));
        const { data } = await supabase
          .from('routine_exercises')
          .insert(rows)
          .select('*, exercise:exercises (*)');
        setDayExercises(targetId, data ?? []);
      }
    },
    [routine, patchDay, setDayExercises]
  );

  return { updateName, setDayRestStatus, setDayNotes, clearDay, copyDay };
}
