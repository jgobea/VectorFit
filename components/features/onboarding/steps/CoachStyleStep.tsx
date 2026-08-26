import { View } from 'react-native';

import { LabeledSlider } from '@/components/ui/LabeledSlider';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { COACHING_STYLE_OPTIONS, INTENSITY_LABELS, INTENSITY_LEVELS } from '@/constants/profileOptions';
import type { OnboardingDraft } from '@/types/onboarding';

interface StepProps {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}

export function CoachStyleStep({ draft, onChange }: StepProps) {
  return (
    <View className="gap-6">
      <LabeledSlider
        label="Feedback intensity"
        value={INTENSITY_LEVELS.indexOf(draft.ai_feedback_intensity)}
        min={0}
        max={2}
        step={1}
        formatValue={(v) => INTENSITY_LABELS[INTENSITY_LEVELS[Math.round(v)]]}
        onChange={(v) => onChange({ ai_feedback_intensity: INTENSITY_LEVELS[Math.round(v)] })}
      />
      <RadioGroup
        label="Coaching style"
        value={draft.ai_coaching_style}
        options={COACHING_STYLE_OPTIONS}
        onChange={(ai_coaching_style) => onChange({ ai_coaching_style })}
      />
    </View>
  );
}
