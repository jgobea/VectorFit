import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { LabeledSlider } from '@/components/ui/LabeledSlider';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { COACHING_STYLE_OPTIONS, INTENSITY_LABEL_KEYS, INTENSITY_LEVELS } from '@/constants/profileOptions';
import type { OnboardingDraft } from '@/types/onboarding';

interface StepProps {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}

export function CoachStyleStep({ draft, onChange }: StepProps) {
  const { t } = useTranslation();
  const coachingStyleOptions = COACHING_STYLE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));
  return (
    <View className="gap-6">
      <LabeledSlider
        label={t('profile.aiSettings.feedbackIntensity')}
        value={INTENSITY_LEVELS.indexOf(draft.ai_feedback_intensity)}
        min={0}
        max={2}
        step={1}
        formatValue={(v) => t(INTENSITY_LABEL_KEYS[INTENSITY_LEVELS[Math.round(v)]])}
        onChange={(v) => onChange({ ai_feedback_intensity: INTENSITY_LEVELS[Math.round(v)] })}
      />
      <RadioGroup
        label={t('profile.aiSettings.coachingStyle')}
        value={draft.ai_coaching_style}
        options={coachingStyleOptions}
        onChange={(ai_coaching_style) => onChange({ ai_coaching_style })}
      />
    </View>
  );
}
