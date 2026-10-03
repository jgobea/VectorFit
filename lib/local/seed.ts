import type { Row } from './schema';
import { uuid } from './schema';

// Exercise catalog, ported from supabase/migrations/20260818210000_seed_exercises.sql,
// 20260825140000_categorize_exercises.sql and 20260827090000_seed_non_quickpose_exercises.sql.
// `quickpose_feature` strings are the exact ones from those migrations.

const QUICKPOSE: [name: string, feature: string, category: string][] = [
  ['Squats', 'fitness.squats', 'Lower Body'],
  ['Push Ups', 'fitness.pushUps', 'Upper Body'],
  ['Jumping Jacks', 'fitness.jumpingJacks', 'Full Body'],
  ['Sumo Squats', 'fitness.sumoSquats', 'Lower Body'],
  ['Lunges', 'fitness.lunges', 'Lower Body'],
  ['Sit Ups', 'fitness.sitUps', 'Core'],
  ['Cobra Wings', 'fitness.cobraWings', 'Upper Body'],
  ['Plank', 'fitness.plank', 'Core'],
  ['Leg Raises', 'fitness.legRaises', 'Core'],
  ['Glute Bridge', 'fitness.gluteBridge', 'Lower Body'],
  ['Overhead Dumbbell Press', 'fitness.overheadDumbbellPress', 'Upper Body'],
  ['V-Ups', 'fitness.vUps', 'Core'],
  ['Lateral Raises', 'fitness.lateralRaises', 'Upper Body'],
  ['Front Raises', 'fitness.frontRaises', 'Upper Body'],
  ['Hip Abduction Standing', 'fitness.hipAbductionStanding', 'Lower Body'],
  ['Side Lunges', 'fitness.sideLunges', 'Lower Body'],
  ['Bicep Curls', 'fitness.bicepCurls', 'Upper Body'],
  ['Knee Raises Bilateral', 'fitness.kneeRaisesBilateral', 'Core'],
];

const MANUAL: [name: string, category: string, muscles: string[], equipment: string, difficulty: string][] = [
  ['Bench Press', 'Upper Body', ['chest', 'triceps', 'shoulders'], 'barbell', 'intermediate'],
  ['Lat Pulldown', 'Upper Body', ['back', 'biceps'], 'cable', 'beginner'],
  ['Barbell Row', 'Upper Body', ['back', 'biceps'], 'barbell', 'intermediate'],
  ['Tricep Pushdown', 'Upper Body', ['triceps'], 'cable', 'beginner'],
  ['Shoulder Press Machine', 'Upper Body', ['shoulders', 'triceps'], 'machine', 'beginner'],
  ['Deadlift', 'Lower Body', ['hamstrings', 'glutes', 'back'], 'barbell', 'advanced'],
  ['Leg Press', 'Lower Body', ['quads', 'glutes'], 'machine', 'beginner'],
  ['Leg Curl', 'Lower Body', ['hamstrings'], 'machine', 'beginner'],
  ['Calf Raises', 'Lower Body', ['calves'], 'machine', 'beginner'],
  ['Cable Crunch', 'Core', ['abs'], 'cable', 'intermediate'],
  ['Russian Twist', 'Core', ['abs', 'obliques'], 'bodyweight', 'beginner'],
  ['Kettlebell Swing', 'Full Body', ['glutes', 'hamstrings', 'shoulders'], 'kettlebell', 'intermediate'],
  ['Treadmill Run', 'Cardio', ['legs', 'cardio'], 'machine', 'beginner'],
  ['Stationary Bike', 'Cardio', ['legs', 'cardio'], 'machine', 'beginner'],
];

export function buildExerciseSeed(): Row[] {
  const created_at = new Date().toISOString();
  const base = {
    equipment: null,
    difficulty: null,
    instructions: null,
    image_url: null,
    video_url: null,
    created_by: null,
    measurement_type: 'reps',
    time_mode: null,
    created_at,
  };
  return [
    ...QUICKPOSE.map(([name, quickpose_feature, category]) => ({
      ...base,
      id: uuid(),
      name,
      category,
      muscle_groups: [],
      quickpose_feature,
    })),
    ...MANUAL.map(([name, category, muscle_groups, equipment, difficulty]) => ({
      ...base,
      id: uuid(),
      name,
      category,
      muscle_groups,
      equipment,
      difficulty,
      quickpose_feature: null,
    })),
  ];
}
