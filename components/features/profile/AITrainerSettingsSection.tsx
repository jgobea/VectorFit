import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ProfileGroup } from '@/components/features/profile/ProfileGroup';
import { QuickEditModal } from '@/components/features/profile/QuickEditModal';
import { ProfileRow } from '@/components/features/profile/ProfileRow';
import { ProfileSection } from '@/components/features/profile/ProfileSection';
import { LabeledSlider } from '@/components/ui/LabeledSlider';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SelectField } from '@/components/ui/SelectField';
import { SelectModal } from '@/components/ui/SelectModal';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { Colors } from '@/constants/theme';
import { COACHING_STYLE_OPTIONS, INTENSITY_LABEL_KEYS, INTENSITY_LEVELS } from '@/constants/profileOptions';
import { playVoiceSample } from '@/lib/voiceSample';
import type { UserProfile } from '@/types/user';

interface AITrainerSettingsSectionProps {
  profile: UserProfile;
  isEditing: boolean;
  onChange: (patch: Partial<UserProfile>) => void;
  onQuickSave: (patch: Partial<UserProfile>) => Promise<boolean>;
  isSavingField: boolean;
}

type QuickField = 'ai_feedback_intensity' | 'voice' | 'language_preference' | 'ai_coaching_style' | null;

const ACCENT = Colors.warning;

// This is the AI trainer's own reply language — separate from the app's UI
// language (LanguageSwitch, stores/localeStore.ts). A user can read the app
// in Spanish while the coach replies in English, or vice versa.
const LANGUAGE_OPTIONS = [
  { value: 'en' as const, label: 'options.language.en' },
  { value: 'es' as const, label: 'options.language.es' },
  { value: 'fr' as const, label: 'options.language.fr' },
  { value: 'de' as const, label: 'options.language.de' },
  { value: 'pt' as const, label: 'options.language.pt' },
];

export function AITrainerSettingsSection({ profile, isEditing, onChange, onQuickSave, isSavingField }: AITrainerSettingsSectionProps) {
  const { t } = useTranslation();
  const languageOptions = LANGUAGE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));
  const coachingStyleOptions = COACHING_STYLE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));

  const [activeField, setActiveField] = useState<QuickField>(null);
  const [intensityDraft, setIntensityDraft] = useState<UserProfile['ai_feedback_intensity']>('moderate');
  const [voiceEnabledDraft, setVoiceEnabledDraft] = useState(false);
  const [voiceVolumeDraft, setVoiceVolumeDraft] = useState(70);

  if (!isEditing) {
    const languageLabel = languageOptions.find((o) => o.value === profile.language_preference)?.label ?? profile.language_preference;
    const styleLabel = coachingStyleOptions.find((o) => o.value === profile.ai_coaching_style)?.label;
    return (
      <>
      <ProfileGroup title={t('profile.aiSettings.title')}>
        <ProfileRow
          icon="sliders"
          accentColor={ACCENT}
          label={t('profile.aiSettings.feedbackIntensity')}
          value={t(INTENSITY_LABEL_KEYS[profile.ai_feedback_intensity])}
          onPress={() => {
            setIntensityDraft(profile.ai_feedback_intensity);
            setActiveField('ai_feedback_intensity');
          }}
        />
        <ProfileRow
          icon="volume-2"
          accentColor={ACCENT}
          label={t('profile.aiSettings.voiceFeedback')}
          value={profile.ai_voice_feedback_enabled ? t('profile.aiSettings.onPercent', { n: profile.ai_voice_volume }) : t('profile.aiSettings.off')}
          onPress={() => {
            setVoiceEnabledDraft(profile.ai_voice_feedback_enabled);
            setVoiceVolumeDraft(profile.ai_voice_volume);
            setActiveField('voice');
          }}
        />
        <ProfileRow
          icon="globe"
          accentColor={ACCENT}
          label={t('profile.aiSettings.language')}
          value={languageLabel ?? '—'}
          onPress={() => setActiveField('language_preference')}
        />
        <ProfileRow
          icon="smile"
          accentColor={ACCENT}
          label={t('profile.aiSettings.coachingStyle')}
          value={styleLabel ?? '—'}
          onPress={() => setActiveField('ai_coaching_style')}
        />
      </ProfileGroup>

        <QuickEditModal
          visible={activeField === 'ai_feedback_intensity'}
          title={t('profile.aiSettings.feedbackIntensity')}
          isSaving={isSavingField}
          onCancel={() => setActiveField(null)}
          onSave={async () => {
            const ok = await onQuickSave({ ai_feedback_intensity: intensityDraft });
            if (ok) setActiveField(null);
          }}
        >
          <LabeledSlider
            label={t('profile.aiSettings.feedbackIntensity')}
            value={INTENSITY_LEVELS.indexOf(intensityDraft)}
            min={0}
            max={2}
            step={1}
            formatValue={(v) => t(INTENSITY_LABEL_KEYS[INTENSITY_LEVELS[Math.round(v)]])}
            onChange={(v) => setIntensityDraft(INTENSITY_LEVELS[Math.round(v)])}
          />
        </QuickEditModal>

        <QuickEditModal
          visible={activeField === 'voice'}
          title={t('profile.aiSettings.voiceFeedback')}
          isSaving={isSavingField}
          onCancel={() => setActiveField(null)}
          onSave={async () => {
            const ok = await onQuickSave({ ai_voice_feedback_enabled: voiceEnabledDraft, ai_voice_volume: voiceVolumeDraft });
            if (ok) setActiveField(null);
          }}
        >
          <ToggleRow
            label={t('profile.aiSettings.voiceFeedback')}
            value={voiceEnabledDraft}
            onChange={(enabled) => {
              setVoiceEnabledDraft(enabled);
              if (enabled) playVoiceSample(profile.language_preference, voiceVolumeDraft);
            }}
          />
          {voiceEnabledDraft && (
            <LabeledSlider
              label={t('profile.aiSettings.voiceVolume')}
              value={voiceVolumeDraft}
              min={0}
              max={100}
              step={5}
              formatValue={(v) => `${Math.round(v)}%`}
              onChange={(v) => setVoiceVolumeDraft(Math.round(v))}
              onSlidingComplete={(v) => playVoiceSample(profile.language_preference, Math.round(v))}
            />
          )}
        </QuickEditModal>

        <SelectModal
          visible={activeField === 'language_preference'}
          title={t('profile.aiSettings.language')}
          options={languageOptions}
          selected={profile.language_preference}
          onClose={() => setActiveField(null)}
          onSelect={async (language_preference) => {
            setActiveField(null);
            await onQuickSave({ language_preference });
          }}
        />
        <SelectModal
          visible={activeField === 'ai_coaching_style'}
          title={t('profile.aiSettings.coachingStyle')}
          options={coachingStyleOptions}
          selected={profile.ai_coaching_style}
          onClose={() => setActiveField(null)}
          onSelect={async (ai_coaching_style) => {
            setActiveField(null);
            await onQuickSave({ ai_coaching_style });
          }}
        />
      </>
    );
  }

  return (
    <ProfileSection title={t('profile.aiSettings.title')} icon="cpu" accentColor={ACCENT}>
      <LabeledSlider
        label={t('profile.aiSettings.feedbackIntensity')}
        value={INTENSITY_LEVELS.indexOf(profile.ai_feedback_intensity)}
        min={0}
        max={2}
        step={1}
        formatValue={(v) => t(INTENSITY_LABEL_KEYS[INTENSITY_LEVELS[Math.round(v)]])}
        onChange={(v) => onChange({ ai_feedback_intensity: INTENSITY_LEVELS[Math.round(v)] })}
      />

      <ToggleRow
        label={t('profile.aiSettings.voiceFeedback')}
        value={profile.ai_voice_feedback_enabled}
        onChange={(ai_voice_feedback_enabled) => {
          onChange({ ai_voice_feedback_enabled });
          if (ai_voice_feedback_enabled) playVoiceSample(profile.language_preference, profile.ai_voice_volume);
        }}
      />

      {profile.ai_voice_feedback_enabled && (
        <LabeledSlider
          label={t('profile.aiSettings.voiceVolume')}
          value={profile.ai_voice_volume}
          min={0}
          max={100}
          step={5}
          formatValue={(v) => `${Math.round(v)}%`}
          onChange={(v) => onChange({ ai_voice_volume: Math.round(v) })}
          onSlidingComplete={(v) => playVoiceSample(profile.language_preference, Math.round(v))}
        />
      )}

      <SelectField
        label={t('profile.aiSettings.language')}
        placeholder={t('profile.aiSettings.chooseLanguage')}
        value={profile.language_preference}
        options={languageOptions}
        onChange={(language_preference) => onChange({ language_preference })}
      />

      <RadioGroup
        label={t('profile.aiSettings.coachingStyle')}
        value={profile.ai_coaching_style}
        options={coachingStyleOptions}
        onChange={(ai_coaching_style) => onChange({ ai_coaching_style })}
      />
    </ProfileSection>
  );
}
