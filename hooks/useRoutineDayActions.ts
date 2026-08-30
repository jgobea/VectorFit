import { useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { useRoutineStore } from '@/stores/routineStore';
import type { RoutineDay } from '@/types/routine';

// Only the fields that matter for "did this day actually change" — day id,
// exercise row ids, and completion-tracking columns are deliberately left
// out, so an unrelated change elsewhere doesn't make an untouched day look
// dirty.
export function dayFingerprint(day: RoutineDay) {
  return JSON.stringify({
    name: day.name,
    is_rest_day: day.is_rest_day,
    exercises: day.exercises.map((e) => ({
      exercise_id: e.exercise_id,
      order_index: e.order_index,
      sets: e.sets,
      reps: e.reps,
      weight_kg: e.weight_kg,
      duration_seconds: e.duration_seconds,
      rest_seconds: e.rest_seconds,
      icon: e.icon,
    })),
  });
}

// Day-level mutations for the routine builder: rename, rest/training
// toggle, clear, and copy-to-other-days. All optimistic — the store
// patches immediately, the Supabase write happens after.
export function useRoutineDayActions() {
  const routine = useRoutineStore((s) => s.routine);
  const patchDay = useRoutineStore((s) => s.patchDay);
  const setDayExercises = useRoutineStore((s) => s.setDayExercises);

  // Each day carries its own name now (e.g. Monday "Chest Day", Tuesday
  // "Triceps Day") rather than one shared name for the whole week.
  const updateDayName = useCallback(
    async (dayId: string, name: string) => {
      patchDay(dayId, { name });
      await supabase.from('routine_days').update({ name }).eq('id', dayId);
    },
    [patchDay]
  );

  const setDayRestStatus = useCallback(
    async (dayId: string, isRestDay: boolean) => {
      patchDay(dayId, { is_rest_day: isRestDay });
      await supabase.from('routine_days').update({ is_rest_day: isRestDay }).eq('id', dayId);
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
        patchDay(targetId, { is_rest_day: source.is_rest_day, notes: source.notes, name: source.name });

        await supabase
          .from('routine_days')
          .update({ is_rest_day: source.is_rest_day, notes: source.notes, name: source.name })
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

  // Restores each day back to a previously-captured snapshot — used when
  // the user leaves the builder without hitting Done. Only days that
  // actually differ from the snapshot are touched, both to avoid pointless
  // writes and because a day's exercises get delete-then-reinserted here
  // (to undo adds/removes/reorders/edits in one shot), which cascades away
  // that day's routine_exercise_completions for today — worth confining to
  // only the days genuinely being reverted.
  const revertToSnapshot = useCallback(
    async (snapshotDays: RoutineDay[]) => {
      for (const snapDay of snapshotDays) {
        const current = routine?.days.find((d) => d.id === snapDay.id);
        if (!current || dayFingerprint(current) === dayFingerprint(snapDay)) continue;

        await supabase
          .from('routine_days')
          .update({ name: snapDay.name, is_rest_day: snapDay.is_rest_day })
          .eq('id', snapDay.id);
        await supabase.from('routine_exercises').delete().eq('routine_day_id', snapDay.id);

        if (snapDay.exercises.length > 0) {
          const rows = snapDay.exercises.map((e) => ({
            id: e.id,
            routine_day_id: snapDay.id,
            exercise_id: e.exercise_id,
            order_index: e.order_index,
            sets: e.sets,
            reps: e.reps,
            weight_kg: e.weight_kg,
            duration_seconds: e.duration_seconds,
            rest_seconds: e.rest_seconds,
            icon: e.icon,
          }));
          await supabase.from('routine_exercises').insert(rows);
        }
      }
    },
    [routine]
  );

  return { updateDayName, setDayRestStatus, clearDay, copyDay, revertToSnapshot };
}
