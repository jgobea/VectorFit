import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { LabeledSlider } from '@/components/ui/LabeledSlider';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SelectField } from '@/components/ui/SelectField';
import { EXPERIENCE_OPTIONS, GOAL_OPTIONS } from '@/constants/profileOptions';
import type { OnboardingDraft } from '@/types/onboarding';

interface StepProps {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}

export function GoalsStep({ draft, onChange }: StepProps) {
  const { t } = useTranslation();
  const goalOptions = GOAL_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));
  const experienceOptions = EXPERIENCE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));
  return (
    <View className="gap-6">
      <SelectField
        label={t('profile.fitnessInfo.primaryGoal')}
        placeholder={t('profile.fitnessInfo.chooseGoal')}
        value={draft.primary_goal}
        options={goalOptions}
        onChange={(primary_goal) => onChange({ primary_goal })}
      />
      <RadioGroup
        label={t('profile.fitnessInfo.experienceLevel')}
        value={draft.experience_level}
        options={experienceOptions}
        onChange={(experience_level) => onChange({ experience_level })}
      />
      <LabeledSlider
        label={t('profile.fitnessInfo.workoutFrequency')}
        value={draft.workout_frequency_days ?? 3}
        min={1}
        max={7}
        step={1}
        formatValue={(v) => t('profile.fitnessInfo.timesPerWeek', { n: Math.round(v) })}
        onChange={(v) => onChange({ workout_frequency_days: Math.round(v) })}
      />
    </View>
  );
}
