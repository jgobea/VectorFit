import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { ProfileGroup } from '@/components/features/profile/ProfileGroup';
import { ProfileRow } from '@/components/features/profile/ProfileRow';
import { ProfileSection } from '@/components/features/profile/ProfileSection';
import { NumberStepperField } from '@/components/ui/NumberStepperField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Colors } from '@/constants/theme';
import { BODY_TYPE_OPTIONS, GENDER_OPTIONS } from '@/constants/profileOptions';
import { cmToFeetInches } from '@/lib/units';
import type { UserProfile } from '@/types/user';

interface PhysicalStatsSectionProps {
  profile: UserProfile;
  isEditing: boolean;
  onChange: (patch: Partial<UserProfile>) => void;
}

const ACCENT = Colors.cyanVivid;

function NumberCell({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text className="font-display text-h2" style={{ color: ACCENT }}>
        {value}
      </Text>
      <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">{label}</Text>
    </View>
  );
}

export function PhysicalStatsSection({ profile, isEditing, onChange }: PhysicalStatsSectionProps) {
  const { t } = useTranslation();
  const genderOptions = GENDER_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));
  const bodyTypeOptions = BODY_TYPE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));

  if (!isEditing) {
    const genderLabel = genderOptions.find((o) => o.value === profile.gender)?.label ?? '—';
    const bodyTypeLabel = bodyTypeOptions.find((o) => o.value === profile.body_type)?.label ?? '—';
    return (
      <ProfileGroup title={t('profile.physicalStats.title')}>
        {/* The three numbers people actually glance at, front and center —
            same big-number treatment as WorkoutHistorySection — instead of
            just another label/value row like everything below it. */}
        <View className="flex-row px-4 py-4">
          <NumberCell value={profile.age ? `${profile.age}` : '—'} label={t('profile.physicalStats.age')} />
          <NumberCell
            value={profile.height_cm ? `${profile.height_cm}` : '—'}
            label={`${t('profile.physicalStats.height')} (cm)`}
          />
          <NumberCell
            value={profile.weight_kg ? `${profile.weight_kg}` : '—'}
            label={`${t('profile.physicalStats.weight')} (kg)`}
          />
        </View>
        <ProfileRow icon="user" accentColor={ACCENT} label={t('profile.physicalStats.gender')} value={genderLabel} />
        <ProfileRow icon="activity" accentColor={ACCENT} label={t('profile.physicalStats.bodyType')} value={bodyTypeLabel} />
        {profile.weight_updated_at && (
          <View className="px-4 pb-3 pt-1">
            <Text className="font-body text-small text-secondary-light dark:text-secondary">
              {t('profile.physicalStats.lastUpdated', { date: new Date(profile.weight_updated_at).toLocaleDateString() })}
            </Text>
          </View>
        )}
      </ProfileGroup>
    );
  }

  return (
    <ProfileSection title={t('profile.physicalStats.title')} icon="activity" accentColor={ACCENT}>
      <View className="flex-row gap-4">
        <View className="flex-1">
          <NumberStepperField
            label={t('profile.physicalStats.age')}
            value={profile.age ?? 25}
            min={13}
            max={120}
            onChange={(age) => onChange({ age })}
          />
        </View>
        <View className="flex-1">
          <NumberStepperField
            label={t('profile.physicalStats.heightCm')}
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
        label={t('profile.physicalStats.weightKg')}
        value={profile.weight_kg ?? 70}
        min={20}
        max={300}
        step={0.5}
        decimals={1}
        onChange={(weight_kg) => onChange({ weight_kg })}
      />

      <RadioGroup label={t('profile.physicalStats.gender')} value={profile.gender} options={genderOptions} onChange={(gender) => onChange({ gender })} />
      <RadioGroup
        label={t('profile.physicalStats.bodyType')}
        value={profile.body_type as (typeof BODY_TYPE_OPTIONS)[number]['value'] | null}
        options={bodyTypeOptions}
        onChange={(body_type) => onChange({ body_type })}
      />
    </ProfileSection>
  );
}
