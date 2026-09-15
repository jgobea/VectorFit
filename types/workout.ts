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
  measurement_type: 'reps' | 'time';
  time_mode: 'countdown' | 'stopwatch' | null;
}
