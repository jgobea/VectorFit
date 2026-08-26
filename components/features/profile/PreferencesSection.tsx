import { Text, View } from 'react-native';

import { ProfileSection } from '@/components/features/profile/ProfileSection';
import { Checkbox } from '@/components/ui/Checkbox';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { SelectField } from '@/components/ui/SelectField';
import { formatTime12h, generateTimeOptions } from '@/lib/time';
import type { UserProfile } from '@/types/user';

interface PreferencesSectionProps {
  profile: UserProfile;
  isEditing: boolean;
  onChange: (patch: Partial<UserProfile>) => void;
}

const WORKOUT_TYPES = ['Strength', 'Cardio', 'Flexibility', 'HIIT'];
const REST_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DURATION_OPTIONS = ([30, 45, 60, 90] as const).map((n) => ({ value: n, label: `${n}m` }));
const TIME_OPTIONS = generateTimeOptions();

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-body text-body text-secondary-light dark:text-secondary">{label}</Text>
      <Text className="font-body-semibold text-body text-primary-light dark:text-primary">{value}</Text>
    </View>
  );
}

export function PreferencesSection({ profile, isEditing, onChange }: PreferencesSectionProps) {
  if (!isEditing) {
    return (
      <ProfileSection title="Preferences">
        <StatRow label="Workout types" value={profile.preferred_workout_types.join(', ') || '—'} />
        <StatRow label="Session length" value={profile.preferred_duration_minutes ? `${profile.preferred_duration_minutes} min` : '—'} />
        <StatRow label="Preferred time" value={formatTime12h(profile.training_time_preference) ?? '—'} />
        <StatRow label="Rest days" value={profile.rest_days.join(', ') || '—'} />
      </ProfileSection>
    );
  }

  return (
    <ProfileSection title="Preferences">
      <View className="gap-2">
        <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">Workout types</Text>
        <View className="flex-row flex-wrap gap-x-4 gap-y-2">
          {WORKOUT_TYPES.map((type) => (
            <Checkbox
              key={type}
              label={type}
              checked={profile.preferred_workout_types.includes(type)}
              onToggle={() => onChange({ preferred_workout_types: toggle(profile.preferred_workout_types, type) })}
            />
          ))}
        </View>
      </View>

      <ChipGroup
        label="Session length"
        value={profile.preferred_duration_minutes}
        options={DURATION_OPTIONS}
        onChange={(preferred_duration_minutes) => onChange({ preferred_duration_minutes })}
      />

      <SelectField
        label="Preferred training time"
        placeholder="Choose a time"
        value={profile.training_time_preference}
        options={TIME_OPTIONS}
        onChange={(training_time_preference) => onChange({ training_time_preference })}
      />

      <View className="gap-2">
        <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">Rest days</Text>
        <View className="flex-row flex-wrap gap-x-4 gap-y-2">
          {REST_DAYS.map((day) => (
            <Checkbox
              key={day}
              label={day}
              checked={profile.rest_days.includes(day)}
              onToggle={() => onChange({ rest_days: toggle(profile.rest_days, day) })}
            />
          ))}
        </View>
      </View>
    </ProfileSection>
  );
}
