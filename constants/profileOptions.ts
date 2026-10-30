// Shared option lists for public.users' enum-like columns — used by both
// the User Info page (components/features/profile/) and the first-login
// onboarding wizard (components/features/onboarding/). Centralized here so
// the two flows can't drift out of sync with each other.
//
// `label` (and `description` / `help`, where present) hold i18n keys
// (lib/i18n/locales/*.ts's `options` namespace), not display text — render
// sites go through localizeOptions() below.

import type { TFunction } from 'i18next';

export const GENDER_OPTIONS = [
  { value: 'male' as const, label: 'options.gender.male' },
  { value: 'female' as const, label: 'options.gender.female' },
  { value: 'other' as const, label: 'options.gender.other' },
  { value: 'prefer_not_to_say' as const, label: 'options.gender.preferNotToSay' },
];

// Standard fitness body-type taxonomy — DESIGN_SPEC.md only says "optional
// classification", not specific labels.
export const BODY_TYPE_OPTIONS = [
  { value: 'Ectomorph', label: 'options.bodyType.ectomorph', help: 'options.bodyTypeHelp.ectomorph' },
  { value: 'Mesomorph', label: 'options.bodyType.mesomorph', help: 'options.bodyTypeHelp.mesomorph' },
  { value: 'Endomorph', label: 'options.bodyType.endomorph', help: 'options.bodyTypeHelp.endomorph' },
];

export const GOAL_OPTIONS = [
  { value: 'muscle_gain' as const, label: 'options.goal.muscleGain' },
  { value: 'fat_loss' as const, label: 'options.goal.fatLoss' },
  { value: 'general_fitness' as const, label: 'options.goal.generalFitness' },
  { value: 'strength' as const, label: 'options.goal.strength' },
];

export const EXPERIENCE_OPTIONS = [
  { value: 'beginner' as const, label: 'options.experience.beginner', description: 'options.experienceHelp.beginner' },
  { value: 'intermediate' as const, label: 'options.experience.intermediate', description: 'options.experienceHelp.intermediate' },
  { value: 'advanced' as const, label: 'options.experience.advanced', description: 'options.experienceHelp.advanced' },
];

export const COACHING_STYLE_OPTIONS = [
  { value: 'motivational' as const, label: 'options.coachingStyle.motivational', description: 'options.coachingStyleHelp.motivational' },
  { value: 'technical' as const, label: 'options.coachingStyle.technical', description: 'options.coachingStyleHelp.technical' },
  { value: 'balanced' as const, label: 'options.coachingStyle.balanced', description: 'options.coachingStyleHelp.balanced' },
];

export const INTENSITY_LEVELS = ['gentle', 'moderate', 'intense'] as const;
export const INTENSITY_LABEL_KEYS = {
  gentle: 'options.intensity.gentle',
  moderate: 'options.intensity.moderate',
  intense: 'options.intensity.intense',
};

// The AI trainer's own reply language — separate from the app's UI language
// (LanguageSwitch, stores/localeStore.ts). A user can read the app in Spanish
// while the coach replies in English, or vice versa.
export const LANGUAGE_OPTIONS = [
  { value: 'en' as const, label: 'options.language.en' },
  { value: 'es' as const, label: 'options.language.es' },
  { value: 'fr' as const, label: 'options.language.fr' },
  { value: 'de' as const, label: 'options.language.de' },
  { value: 'pt' as const, label: 'options.language.pt' },
];

interface OptionDef<T extends string> {
  value: T;
  label: string;
  description?: string;
  help?: string;
}

export interface LocalizedOption<T extends string> {
  value: T;
  label: string;
  /** Short line shown under the label, in the same card. */
  description?: string;
  /** Longer explanation behind a help button next to the option. */
  help?: { title: string; message: string };
}

// Body-type help ends with the same "check with a professional" note on
// every option: it's a rough self-classification, not an assessment.
export function localizeOptions<T extends string>(t: TFunction, options: readonly OptionDef<T>[]): LocalizedOption<T>[] {
  return options.map((o) => {
    const label = t(o.label);
    return {
      value: o.value,
      label,
      ...(o.description && { description: t(o.description) }),
      ...(o.help && {
        help: {
          title: t('options.bodyTypeHelp.title', { name: label }),
          message: `${t(o.help)}\n\n${t('options.bodyTypeHelp.disclaimer')}`,
        },
      }),
    };
  });
}
