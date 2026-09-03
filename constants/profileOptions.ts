// Shared option lists for public.users' enum-like columns — used by both
// the User Info page (components/features/profile/) and the first-login
// onboarding wizard (components/features/onboarding/). Centralized here so
// the two flows can't drift out of sync with each other.
//
// `label` holds an i18n key (lib/i18n/locales/*.ts's `options` namespace),
// not display text — every render site must pass it through t().

export const GENDER_OPTIONS = [
  { value: 'male' as const, label: 'options.gender.male' },
  { value: 'female' as const, label: 'options.gender.female' },
  { value: 'other' as const, label: 'options.gender.other' },
  { value: 'prefer_not_to_say' as const, label: 'options.gender.preferNotToSay' },
];

// Standard fitness body-type taxonomy — DESIGN_SPEC.md only says "optional
// classification", not specific labels.
export const BODY_TYPE_OPTIONS = [
  { value: 'Ectomorph', label: 'options.bodyType.ectomorph' },
  { value: 'Mesomorph', label: 'options.bodyType.mesomorph' },
  { value: 'Endomorph', label: 'options.bodyType.endomorph' },
];

export const GOAL_OPTIONS = [
  { value: 'muscle_gain' as const, label: 'options.goal.muscleGain' },
  { value: 'fat_loss' as const, label: 'options.goal.fatLoss' },
  { value: 'general_fitness' as const, label: 'options.goal.generalFitness' },
  { value: 'strength' as const, label: 'options.goal.strength' },
];

export const EXPERIENCE_OPTIONS = [
  { value: 'beginner' as const, label: 'options.experience.beginner' },
  { value: 'intermediate' as const, label: 'options.experience.intermediate' },
  { value: 'advanced' as const, label: 'options.experience.advanced' },
];

export const COACHING_STYLE_OPTIONS = [
  { value: 'motivational' as const, label: 'options.coachingStyle.motivational' },
  { value: 'technical' as const, label: 'options.coachingStyle.technical' },
  { value: 'balanced' as const, label: 'options.coachingStyle.balanced' },
];

export const INTENSITY_LEVELS = ['gentle', 'moderate', 'intense'] as const;
export const INTENSITY_LABEL_KEYS = {
  gentle: 'options.intensity.gentle',
  moderate: 'options.intensity.moderate',
  intense: 'options.intensity.intense',
};
