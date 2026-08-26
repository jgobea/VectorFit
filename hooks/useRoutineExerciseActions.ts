import { useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { useRoutineStore } from '@/stores/routineStore';
import type { RoutineExercise } from '@/types/routine';
import type { Exercise } from '@/types/workout';

const DEFAULT_SETS = 1;
const DEFAULT_REPS = 10;
const DEFAULT_REST_SECONDS = 60;

// Exercise-level mutations within a routine day: add/remove, edit
// sets/reps/weight/rest, and reorder. Add/remove/reorder wait for the
// Supabase response before patching the store (need the real row id or the
// swapped order_index pair); field edits patch optimistically.
export function useRoutineExerciseActions() {
  const routine = useRoutineStore((s) => s.routine);
  const setDayExercises = useRoutineStore((s) => s.setDayExercises);
  const patchExercise = useRoutineStore((s) => s.patchExercise);

  const addExercise = useCallback(
    async (dayId: string, exercise: Exercise) => {
      const day = routine?.days.find((d) => d.id === dayId);
      if (!day) return;

      const { data } = await supabase
        .from('routine_exercises')
        .insert({
          routine_day_id: dayId,
          exercise_id: exercise.id,
          order_index: day.exercises.length,
          sets: DEFAULT_SETS,
          reps: DEFAULT_REPS,
          rest_seconds: DEFAULT_REST_SECONDS,
        })
        .select('*, exercise:exercises (*)')
        .single();

      if (data) setDayExercises(dayId, [...day.exercises, data]);
    },
    [routine, setDayExercises]
  );

  const updateExercise = useCallback(
    async (
      exerciseRowId: string,
      patch: Partial<Pick<RoutineExercise, 'sets' | 'reps' | 'weight_kg' | 'rest_seconds' | 'icon'>>
    ) => {
      patchExercise(exerciseRowId, patch);
      await supabase.from('routine_exercises').update(patch).eq('id', exerciseRowId);
    },
    [patchExercise]
  );

  const removeExercise = useCallback(
    async (dayId: string, exerciseRowId: string) => {
      const day = routine?.days.find((d) => d.id === dayId);
      if (!day) return;
      setDayExercises(
        dayId,
        day.exercises.filter((e) => e.id !== exerciseRowId)
      );
      await supabase.from('routine_exercises').delete().eq('id', exerciseRowId);
    },
    [routine, setDayExercises]
  );

  const moveExercise = useCallback(
    async (dayId: string, exerciseRowId: string, direction: 'up' | 'down') => {
      const day = routine?.days.find((d) => d.id === dayId);
      if (!day) return;
      const index = day.exercises.findIndex((e) => e.id === exerciseRowId);
      const swapWith = direction === 'up' ? index - 1 : index + 1;
      if (index === -1 || swapWith < 0 || swapWith >= day.exercises.length) return;

      const reordered = [...day.exercises];
      const [a, b] = [reordered[index], reordered[swapWith]];
      reordered[index] = { ...b, order_index: a.order_index };
      reordered[swapWith] = { ...a, order_index: b.order_index };
      setDayExercises(dayId, reordered);

      await Promise.all([
        supabase.from('routine_exercises').update({ order_index: a.order_index }).eq('id', b.id),
        supabase.from('routine_exercises').update({ order_index: b.order_index }).eq('id', a.id),
      ]);
    },
    [routine, setDayExercises]
  );

  return { addExercise, updateExercise, removeExercise, moveExercise };
}
