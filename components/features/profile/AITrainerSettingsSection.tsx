import { Text, View } from 'react-native';

import { ProfileSection } from '@/components/features/profile/ProfileSection';
import { LabeledSlider } from '@/components/ui/LabeledSlider';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SelectField } from '@/components/ui/SelectField';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { COACHING_STYLE_OPTIONS, INTENSITY_LABELS, INTENSITY_LEVELS } from '@/constants/profileOptions';
import type { UserProfile } from '@/types/user';

interface AITrainerSettingsSectionProps {
  profile: UserProfile;
  isEditing: boolean;
  onChange: (patch: Partial<UserProfile>) => void;
}

const LANGUAGE_OPTIONS = [
  { value: 'en' as const, label: 'English' },
  { value: 'es' as const, label: 'Spanish' },
  { value: 'fr' as const, label: 'French' },
  { value: 'de' as const, label: 'German' },
  { value: 'pt' as const, label: 'Portuguese' },
];

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-body text-body text-secondary-light dark:text-secondary">{label}</Text>
      <Text className="font-body-semibold text-body text-primary-light dark:text-primary">{value}</Text>
    </View>
  );
}

export function AITrainerSettingsSection({ profile, isEditing, onChange }: AITrainerSettingsSectionProps) {
  if (!isEditing) {
    const languageLabel = LANGUAGE_OPTIONS.find((o) => o.value === profile.language_preference)?.label ?? profile.language_preference;
    const styleLabel = COACHING_STYLE_OPTIONS.find((o) => o.value === profile.ai_coaching_style)?.label;
    return (
      <ProfileSection title="AI Trainer Settings">
        <StatRow label="Feedback intensity" value={INTENSITY_LABELS[profile.ai_feedback_intensity]} />
        <StatRow label="Voice feedback" value={profile.ai_voice_feedback_enabled ? `On (${profile.ai_voice_volume}%)` : 'Off'} />
        <StatRow label="Language" value={languageLabel} />
        <StatRow label="Coaching style" value={styleLabel ?? '—'} />
      </ProfileSection>
    );
  }

  return (
    <ProfileSection title="AI Trainer Settings">
      <LabeledSlider
        label="Feedback intensity"
        value={INTENSITY_LEVELS.indexOf(profile.ai_feedback_intensity)}
        min={0}
        max={2}
        step={1}
        formatValue={(v) => INTENSITY_LABELS[INTENSITY_LEVELS[Math.round(v)]]}
        onChange={(v) => onChange({ ai_feedback_intensity: INTENSITY_LEVELS[Math.round(v)] })}
      />

      <ToggleRow
        label="Voice feedback"
        value={profile.ai_voice_feedback_enabled}
        onChange={(ai_voice_feedback_enabled) => onChange({ ai_voice_feedback_enabled })}
      />

      {profile.ai_voice_feedback_enabled && (
        <LabeledSlider
          label="Voice volume"
          value={profile.ai_voice_volume}
          min={0}
          max={100}
          step={5}
          formatValue={(v) => `${Math.round(v)}%`}
          onChange={(v) => onChange({ ai_voice_volume: Math.round(v) })}
        />
      )}

      <SelectField
        label="Language"
        placeholder="Choose a language"
        value={profile.language_preference}
        options={LANGUAGE_OPTIONS}
        onChange={(language_preference) => onChange({ language_preference })}
      />

      <RadioGroup
        label="Coaching style"
        value={profile.ai_coaching_style}
        options={COACHING_STYLE_OPTIONS}
        onChange={(ai_coaching_style) => onChange({ ai_coaching_style })}
      />
    </ProfileSection>
  );
}
