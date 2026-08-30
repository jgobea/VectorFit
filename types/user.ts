// Hand-written stand-in for Database['public']['Tables']['users']['Row'].
// Once a local/linked Supabase project exists, run
// `npx supabase gen types typescript --local > types/supabase.ts` and
// replace this with a derived alias — INSTRUCTIONS.md forbids hand-writing
// Supabase row types long-term.
export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  weight_updated_at: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  body_type: string | null;
  primary_goal: 'muscle_gain' | 'fat_loss' | 'general_fitness' | 'strength' | null;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | null;
  workout_frequency_days: number | null;
  injuries_limitations: string | null;
  ai_feedback_intensity: 'gentle' | 'moderate' | 'intense';
  ai_voice_feedback_enabled: boolean;
  ai_voice_volume: number;
  language_preference: string;
  ai_coaching_style: 'motivational' | 'technical' | 'balanced';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}
