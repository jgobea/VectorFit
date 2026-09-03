import { useCallback } from 'react';

import { useAllExercises } from '@/hooks/useAllExercises';
import { useRoutine } from '@/hooks/useRoutine';
import { useRoutineDayActions } from '@/hooks/useRoutineDayActions';
import { useRoutineExerciseActions } from '@/hooks/useRoutineExerciseActions';
import type { SuggestedExercise } from '@/lib/exerciseSuggestion';

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Resolves a chat-suggested exercise — a name only, no catalog id, since the
// AI has no way to know this app's exercise ids — against the real catalog
// by exact (case/whitespace-insensitive) name match, falling back to
// creating it as a custom exercise the same way the routine builder's "Add
// your own exercise" does. Then adds it to the chosen day carrying the AI's
// own suggested sets/reps/weight/rest, instead of useRoutineExerciseActions'
// usual blank defaults.
export function useAddSuggestedExercise() {
  const { exercises, isLoading: isCatalogLoading, createCustomExercise } = useAllExercises();
  const { routine, isLoading: isRoutineLoading } = useRoutine({ createIfMissing: true });
  const { addExercise } = useRoutineExerciseActions();
  const { setDayRestStatus } = useRoutineDayActions();

  const addToDay = useCallback(
    async (suggestion: SuggestedExercise, dayId: string): Promise<boolean> => {
      const day = routine?.days.find((d) => d.id === dayId);
      if (!day) return false;

      const target = normalize(suggestion.name);
      let exercise = exercises.find((e) => normalize(e.name) === target) ?? null;

      const isTimeBased = suggestion.duration_seconds != null && suggestion.reps == null;
      if (!exercise) {
        exercise = await createCustomExercise(
          suggestion.name,
          null,
          isTimeBased ? 'time' : 'reps',
          isTimeBased ? 'stopwatch' : null
        );
        if (!exercise) return false;
      }

      // A rest day's exercises are hidden behind RestDayPanel in the
      // builder and behind the rest-day branch in Today's Workout — adding
      // one here without also flipping the day to training would make it
      // invisible everywhere else in the app.
      if (day.is_rest_day) await setDayRestStatus(dayId, false);

      await addExercise(day.id, exercise, {
        sets: suggestion.sets,
        reps: isTimeBased ? null : suggestion.reps,
        weight_kg: suggestion.weight_kg,
        duration_seconds: isTimeBased ? suggestion.duration_seconds : null,
        rest_seconds: suggestion.rest_seconds,
      });
      return true;
    },
    [routine, exercises, createCustomExercise, setDayRestStatus, addExercise]
  );

  return { routine, isLoading: isCatalogLoading || isRoutineLoading, addToDay };
}
