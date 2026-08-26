import type { Feather } from '@expo/vector-icons';

// Limited, curated set of Feather glyphs a user can assign to a routine
// exercise — Feather has no literal "dumbbell", so these read generically
// across exercise types (strength, cardio, mobility, etc.) rather than
// trying to match one icon per muscle group.
export const EXERCISE_ICON_OPTIONS = [
  'activity',
  'zap',
  'heart',
  'target',
  'trending-up',
  'repeat',
  'anchor',
  'shield',
  'wind',
  'award',
] as const satisfies readonly (keyof typeof Feather.glyphMap)[];

export type ExerciseIconName = (typeof EXERCISE_ICON_OPTIONS)[number];

export const DEFAULT_EXERCISE_ICON: ExerciseIconName = 'activity';

export function isExerciseIconName(value: string | null | undefined): value is ExerciseIconName {
  return !!value && (EXERCISE_ICON_OPTIONS as readonly string[]).includes(value);
}
