import { useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { useRoutineStore } from '@/stores/routineStore';
import type { RoutineExercise } from '@/types/routine';
import type { Exercise } from '@/types/workout';

const DEFAULT_SETS = 1;
const DEFAULT_REPS = 10;
const DEFAULT_REST_SECONDS = 60;
const DEFAULT_DURATION_SECONDS = 30;

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

      const isTimeBased = exercise.measurement_type === 'time';
      const { data } = await supabase
        .from('routine_exercises')
        .insert({
          routine_day_id: dayId,
          exercise_id: exercise.id,
          order_index: day.exercises.length,
          sets: DEFAULT_SETS,
          reps: isTimeBased ? null : DEFAULT_REPS,
          duration_seconds: isTimeBased ? DEFAULT_DURATION_SECONDS : null,
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
      patch: Partial<Pick<RoutineExercise, 'sets' | 'reps' | 'weight_kg' | 'duration_seconds' | 'rest_seconds' | 'icon'>>
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

  // Drag-and-drop drop handler: caller hands back the exercise row ids in
  // their new visual order, we assign fresh sequential order_index values
  // and persist only the rows whose index actually changed.
  const reorderExercises = useCallback(
    async (dayId: string, orderedExerciseIds: string[]) => {
      const day = routine?.days.find((d) => d.id === dayId);
      if (!day) return;

      const byId = new Map(day.exercises.map((e) => [e.id, e]));
      const reordered = orderedExerciseIds
        .map((id, index) => {
          const exercise = byId.get(id);
          return exercise ? { ...exercise, order_index: index } : null;
        })
        .filter((e): e is RoutineExercise => e !== null);
      if (reordered.length !== day.exercises.length) return;

      setDayExercises(dayId, reordered);

      const changed = reordered.filter((e) => byId.get(e.id)?.order_index !== e.order_index);
      await Promise.all(
        changed.map((e) => supabase.from('routine_exercises').update({ order_index: e.order_index }).eq('id', e.id))
      );
    },
    [routine, setDayExercises]
  );

  return { addExercise, updateExercise, removeExercise, reorderExercises };
}
