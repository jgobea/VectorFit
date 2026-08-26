// Hand-written stand-ins for the generated Supabase row types — see the note
// in types/user.ts.
export interface Exercise {
  id: string;
  name: string;
  category: string | null;
  muscle_groups: string[];
  equipment: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  instructions: string | null;
  image_url: string | null;
  video_url: string | null;
  quickpose_feature: string | null;
  created_by: string | null;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string | null;
  status: 'in_progress' | 'completed' | 'cancelled';
  started_at: string;
  ended_at: string | null;
  calories_burned: number | null;
  duration_seconds: number | null;
  notes: string | null;
}
