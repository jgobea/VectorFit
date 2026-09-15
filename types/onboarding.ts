import type { UserProfile } from '@/types/user';

// Draft state for the first-login wizard (app/onboarding.tsx) — a lean
// subset of UserProfile's editable fields, picked deliberately small to
// keep onboarding fast (see components/features/onboarding/steps/ for the
// per-field UI). Everything else (preferences, injuries, AI reply language)
// defaults sensibly and stays editable later from Profile.
export interface OnboardingDraft {
  full_name: string;
  age: number;
  gender: UserProfile['gender'];
  height_cm: number;
  weight_kg: number;
  body_type: string | null;
  primary_goal: UserProfile['primary_goal'];
  experience_level: UserProfile['experience_level'];
  workout_frequency_days: number | null;
  ai_feedback_intensity: UserProfile['ai_feedback_intensity'];
  ai_coaching_style: UserProfile['ai_coaching_style'];
  ai_voice_feedback_enabled: UserProfile['ai_voice_feedback_enabled'];
  ai_voice_volume: UserProfile['ai_voice_volume'];
}

export const DEFAULT_ONBOARDING_DRAFT: OnboardingDraft = {
  full_name: '',
  age: 25,
  gender: null,
  height_cm: 170,
  weight_kg: 70,
  body_type: null,
  primary_goal: null,
  experience_level: null,
  workout_frequency_days: null,
  ai_feedback_intensity: 'moderate',
  ai_coaching_style: 'balanced',
  ai_voice_feedback_enabled: false,
  ai_voice_volume: 70,
};
