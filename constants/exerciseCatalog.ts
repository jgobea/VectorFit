import type { TFunction } from 'i18next';

// Exact `exercises.name` strings from the seed migrations
// (supabase/migrations/20260818210000_seed_exercises.sql and
// 20260827090000_seed_non_quickpose_exercises.sql) mapped to i18n keys, so
// the catalog's fixed set of names follows the app's UI language. A
// user-created custom exercise has no entry here — translateExerciseName
// falls back to whatever they typed, unchanged.
export const EXERCISE_NAME_KEYS: Record<string, string> = {
  Squats: 'exercises.names.squats',
  'Push Ups': 'exercises.names.pushUps',
  'Jumping Jacks': 'exercises.names.jumpingJacks',
  'Sumo Squats': 'exercises.names.sumoSquats',
  Lunges: 'exercises.names.lunges',
  'Sit Ups': 'exercises.names.sitUps',
  'Cobra Wings': 'exercises.names.cobraWings',
  Plank: 'exercises.names.plank',
  'Leg Raises': 'exercises.names.legRaises',
  'Glute Bridge': 'exercises.names.gluteBridge',
  'Overhead Dumbbell Press': 'exercises.names.overheadDumbbellPress',
  'V-Ups': 'exercises.names.vUps',
  'Lateral Raises': 'exercises.names.lateralRaises',
  'Front Raises': 'exercises.names.frontRaises',
  'Hip Abduction Standing': 'exercises.names.hipAbductionStanding',
  'Side Lunges': 'exercises.names.sideLunges',
  'Bicep Curls': 'exercises.names.bicepCurls',
  'Knee Raises Bilateral': 'exercises.names.kneeRaisesBilateral',
  'Bench Press': 'exercises.names.benchPress',
  'Lat Pulldown': 'exercises.names.latPulldown',
  'Barbell Row': 'exercises.names.barbellRow',
  'Tricep Pushdown': 'exercises.names.tricepPushdown',
  'Shoulder Press Machine': 'exercises.names.shoulderPressMachine',
  Deadlift: 'exercises.names.deadlift',
  'Leg Press': 'exercises.names.legPress',
  'Leg Curl': 'exercises.names.legCurl',
  'Calf Raises': 'exercises.names.calfRaises',
  'Cable Crunch': 'exercises.names.cableCrunch',
  'Russian Twist': 'exercises.names.russianTwist',
  'Kettlebell Swing': 'exercises.names.kettlebellSwing',
  'Treadmill Run': 'exercises.names.treadmillRun',
  'Stationary Bike': 'exercises.names.stationaryBike',
};

// Reuses progress.categories' keys (app/progress.tsx) — same 5 body-area
// values, the standard fitness taxonomy the catalog's `category` column
// holds (see 20260825140000_categorize_exercises.sql and
// 20260827090000_seed_non_quickpose_exercises.sql).
export const EXERCISE_CATEGORY_KEYS: Record<string, string> = {
  'Upper Body': 'progress.categories.upperBody',
  'Lower Body': 'progress.categories.lowerBody',
  Core: 'progress.categories.core',
  'Full Body': 'progress.categories.fullBody',
  Cardio: 'progress.categories.cardio',
};

// `name` falls back to the raw string (untranslated) for anything not in
// EXERCISE_NAME_KEYS — a custom exercise the user typed themselves, or an
// AI-suggested one that doesn't match the catalog.
export function translateExerciseName(t: TFunction, name: string | null | undefined): string {
  if (!name) return t('common.exercise');
  const key = EXERCISE_NAME_KEYS[name];
  return key ? t(key) : name;
}

export function translateExerciseCategory(t: TFunction, category: string | null | undefined): string | null {
  if (!category) return null;
  const key = EXERCISE_CATEGORY_KEYS[category];
  return key ? t(key) : category;
}
