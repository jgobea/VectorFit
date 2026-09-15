import type { Exercise } from '@/types/workout';

// Hand-written stand-in for the generated Supabase row types — see the note
// in types/user.ts. day_of_week matches JS Date#getDay() (0=Sunday..6=Saturday).
export interface RoutineExercise {
  id: string;
  routine_day_id: string;
  exercise_id: string;
  order_index: number;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  rest_seconds: number | null;
  icon: string | null;
  exercise?: Exercise;
}

export interface RoutineDay {
  id: string;
  routine_id: string;
  day_of_week: number;
  is_rest_day: boolean;
  name: string | null;
  notes: string | null;
  exercises: RoutineExercise[];
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  days: RoutineDay[];
}
