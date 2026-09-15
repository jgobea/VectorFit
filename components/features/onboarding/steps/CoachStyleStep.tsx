import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { LabeledSlider } from '@/components/ui/LabeledSlider';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { COACHING_STYLE_OPTIONS, INTENSITY_LABEL_KEYS, INTENSITY_LEVELS } from '@/constants/profileOptions';
import { playVoiceSample } from '@/lib/voiceSample';
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
      <ToggleRow
        label={t('profile.aiSettings.voiceFeedback')}
        value={draft.ai_voice_feedback_enabled}
        onChange={(ai_voice_feedback_enabled) => {
          onChange({ ai_voice_feedback_enabled });
          if (ai_voice_feedback_enabled) playVoiceSample(undefined, draft.ai_voice_volume);
        }}
      />
      {draft.ai_voice_feedback_enabled && (
        <LabeledSlider
          label={t('profile.aiSettings.voiceVolume')}
          value={draft.ai_voice_volume}
          min={0}
          max={100}
          step={5}
          formatValue={(v) => `${Math.round(v)}%`}
          onChange={(v) => onChange({ ai_voice_volume: Math.round(v) })}
          onSlidingComplete={(v) => playVoiceSample(undefined, Math.round(v))}
        />
      )}
    </View>
  );
}
