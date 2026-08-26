// Shared option lists for public.users' enum-like columns — used by both
// the User Info page (components/features/profile/) and the first-login
// onboarding wizard (components/features/onboarding/). Centralized here so
// the two flows can't drift out of sync with each other.

export const GENDER_OPTIONS = [
  { value: 'male' as const, label: 'Male' },
  { value: 'female' as const, label: 'Female' },
  { value: 'other' as const, label: 'Other' },
  { value: 'prefer_not_to_say' as const, label: 'Prefer not to say' },
];

// Standard fitness body-type taxonomy — DESIGN_SPEC.md only says "optional
// classification", not specific labels.
export const BODY_TYPE_OPTIONS = [
  { value: 'Ectomorph', label: 'Ectomorph' },
  { value: 'Mesomorph', label: 'Mesomorph' },
  { value: 'Endomorph', label: 'Endomorph' },
];

export const GOAL_OPTIONS = [
  { value: 'muscle_gain' as const, label: 'Muscle Gain' },
  { value: 'fat_loss' as const, label: 'Fat Loss' },
  { value: 'general_fitness' as const, label: 'General Fitness' },
  { value: 'strength' as const, label: 'Strength' },
];

export const EXPERIENCE_OPTIONS = [
  { value: 'beginner' as const, label: 'Beginner' },
  { value: 'intermediate' as const, label: 'Intermediate' },
  { value: 'advanced' as const, label: 'Advanced' },
];

export const COACHING_STYLE_OPTIONS = [
  { value: 'motivational' as const, label: 'Motivational' },
  { value: 'technical' as const, label: 'Technical' },
  { value: 'balanced' as const, label: 'Balanced' },
];

export const INTENSITY_LEVELS = ['gentle', 'moderate', 'intense'] as const;
export const INTENSITY_LABELS = { gentle: 'Gentle', moderate: 'Moderate', intense: 'Intense' };
