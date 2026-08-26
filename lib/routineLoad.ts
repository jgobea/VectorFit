import type { RoutineExercise } from '@/types/routine';

// "Load volume" — total weight moved, the one figure calculable from what
// the routine builder already tracks (sets × reps × weight) without needing
// calorie estimation, which the app doesn't do anywhere. Bodyweight
// exercises (no weight_kg) don't contribute — there's no weight to sum.
export function calculateLoadKg(exercises: RoutineExercise[]): number {
  return exercises.reduce((sum, e) => sum + (e.sets ?? 0) * (e.reps ?? 0) * (e.weight_kg ?? 0), 0);
}
