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
  return (
    <View className="gap-6">
      <SelectField
        label="Primary goal"
        placeholder="Choose a goal"
        value={draft.primary_goal}
        options={GOAL_OPTIONS}
        onChange={(primary_goal) => onChange({ primary_goal })}
      />
      <RadioGroup
        label="Experience level"
        value={draft.experience_level}
        options={EXPERIENCE_OPTIONS}
        onChange={(experience_level) => onChange({ experience_level })}
      />
      <LabeledSlider
        label="Workout frequency"
        value={draft.workout_frequency_days ?? 3}
        min={1}
        max={7}
        step={1}
        formatValue={(v) => `${Math.round(v)}x / week`}
        onChange={(v) => onChange({ workout_frequency_days: Math.round(v) })}
      />
    </View>
  );
}
