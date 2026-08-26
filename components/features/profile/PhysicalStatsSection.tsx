import { Text, View } from 'react-native';

import { ProfileSection } from '@/components/features/profile/ProfileSection';
import { NumberStepperField } from '@/components/ui/NumberStepperField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { BODY_TYPE_OPTIONS, GENDER_OPTIONS } from '@/constants/profileOptions';
import { cmToFeetInches } from '@/lib/units';
import type { UserProfile } from '@/types/user';

interface PhysicalStatsSectionProps {
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

export function PhysicalStatsSection({ profile, isEditing, onChange }: PhysicalStatsSectionProps) {
  if (!isEditing) {
    const genderLabel = GENDER_OPTIONS.find((o) => o.value === profile.gender)?.label ?? '—';
    return (
      <ProfileSection title="Physical Stats">
        <StatRow label="Age" value={profile.age ? `${profile.age}` : '—'} />
        <StatRow label="Height" value={profile.height_cm ? `${profile.height_cm} cm` : '—'} />
        <StatRow label="Weight" value={profile.weight_kg ? `${profile.weight_kg} kg` : '—'} />
        <StatRow label="Gender" value={genderLabel} />
        <StatRow label="Body type" value={profile.body_type ?? '—'} />
        {profile.weight_updated_at && (
          <Text className="font-body text-small text-secondary-light dark:text-secondary">
            Last updated: {new Date(profile.weight_updated_at).toLocaleDateString()}
          </Text>
        )}
      </ProfileSection>
    );
  }

  return (
    <ProfileSection title="Physical Stats">
      <View className="flex-row gap-4">
        <View className="flex-1">
          <NumberStepperField
            label="Age"
            value={profile.age ?? 25}
            min={13}
            max={120}
            onChange={(age) => onChange({ age })}
          />
        </View>
        <View className="flex-1">
          <NumberStepperField
            label="Height (cm)"
            value={profile.height_cm ?? 170}
            min={100}
            max={250}
            onChange={(height_cm) => onChange({ height_cm })}
          />
        </View>
      </View>
      {profile.height_cm != null && (
        <Text className="-mt-2 font-body text-small text-secondary-light dark:text-secondary">
          ≈ {cmToFeetInches(profile.height_cm)}
        </Text>
      )}

      <NumberStepperField
        label="Weight (kg)"
        value={profile.weight_kg ?? 70}
        min={20}
        max={300}
        step={0.5}
        decimals={1}
        onChange={(weight_kg) => onChange({ weight_kg })}
      />

      <RadioGroup label="Gender" value={profile.gender} options={GENDER_OPTIONS} onChange={(gender) => onChange({ gender })} />
      <RadioGroup
        label="Body type"
        value={profile.body_type as (typeof BODY_TYPE_OPTIONS)[number]['value'] | null}
        options={BODY_TYPE_OPTIONS}
        onChange={(body_type) => onChange({ body_type })}
      />
    </ProfileSection>
  );
}
