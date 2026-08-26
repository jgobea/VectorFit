import { Text, View } from 'react-native';

import { ProfileSection } from '@/components/features/profile/ProfileSection';
import { Input } from '@/components/ui/Input';
import { LabeledSlider } from '@/components/ui/LabeledSlider';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SelectField } from '@/components/ui/SelectField';
import { EXPERIENCE_OPTIONS, GOAL_OPTIONS } from '@/constants/profileOptions';
import type { UserProfile } from '@/types/user';

interface FitnessInfoSectionProps {
  profile: UserProfile;
  isEditing: boolean;
  onChange: (patch: Partial<UserProfile>) => void;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-body text-body text-secondary-light dark:text-secondary">{label}</Text>
      <Text className="font-body-semibold text-body text-primary-light dark:text-primary">{value}</Text>
    </View>
  );
}

export function FitnessInfoSection({ profile, isEditing, onChange }: FitnessInfoSectionProps) {
  if (!isEditing) {
    const goalLabel = GOAL_OPTIONS.find((o) => o.value === profile.primary_goal)?.label ?? '—';
    const experienceLabel = EXPERIENCE_OPTIONS.find((o) => o.value === profile.experience_level)?.label ?? '—';
    return (
      <ProfileSection title="Fitness Information">
        <StatRow label="Primary goal" value={goalLabel} />
        <StatRow label="Experience level" value={experienceLabel} />
        <StatRow label="Workout frequency" value={profile.workout_frequency_days ? `${profile.workout_frequency_days}x / week` : '—'} />
        {profile.injuries_limitations ? (
          <View className="gap-1">
            <Text className="font-body text-body text-secondary-light dark:text-secondary">Injuries / limitations</Text>
            <Text className="font-body text-body text-primary-light dark:text-primary">{profile.injuries_limitations}</Text>
          </View>
        ) : (
          <StatRow label="Injuries / limitations" value="None noted" />
        )}
      </ProfileSection>
    );
  }

  return (
    <ProfileSection title="Fitness Information">
      <SelectField
        label="Primary goal"
        placeholder="Choose a goal"
        value={profile.primary_goal}
        options={GOAL_OPTIONS}
        onChange={(primary_goal) => onChange({ primary_goal })}
      />
      <RadioGroup
        label="Experience level"
        value={profile.experience_level}
        options={EXPERIENCE_OPTIONS}
        onChange={(experience_level) => onChange({ experience_level })}
      />
      <LabeledSlider
        label="Workout frequency"
        value={profile.workout_frequency_days ?? 3}
        min={1}
        max={7}
        step={1}
        formatValue={(v) => `${Math.round(v)}x / week`}
        onChange={(v) => onChange({ workout_frequency_days: Math.round(v) })}
      />
      <Input
        label="Injuries / limitations"
        placeholder="e.g. lower back sensitivity"
        value={profile.injuries_limitations ?? ''}
        onChangeText={(injuries_limitations) => onChange({ injuries_limitations })}
        multiline
      />
    </ProfileSection>
  );
}
