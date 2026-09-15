import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { ProfileGroup } from '@/components/features/profile/ProfileGroup';
import { QuickEditModal } from '@/components/features/profile/QuickEditModal';
import { ProfileRow } from '@/components/features/profile/ProfileRow';
import { ProfileSection } from '@/components/features/profile/ProfileSection';
import { NumberStepperField } from '@/components/ui/NumberStepperField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SelectModal } from '@/components/ui/SelectModal';
import { Colors } from '@/constants/theme';
import { BODY_TYPE_OPTIONS, GENDER_OPTIONS } from '@/constants/profileOptions';
import { cmToFeetInches } from '@/lib/units';
import type { UserProfile } from '@/types/user';

interface PhysicalStatsSectionProps {
  profile: UserProfile;
  isEditing: boolean;
  onChange: (patch: Partial<UserProfile>) => void;
  onQuickSave: (patch: Partial<UserProfile>) => Promise<boolean>;
  isSavingField: boolean;
}

type QuickField = 'age' | 'height_cm' | 'weight_kg' | 'gender' | 'body_type' | null;

const ACCENT = Colors.cyanVivid;

function NumberCell({ value, label, onPress }: { value: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="flex-1 items-center gap-1 active:opacity-60">
      <Text className="font-display text-h2" style={{ color: ACCENT }}>
        {value}
      </Text>
      <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">{label}</Text>
    </Pressable>
  );
}

export function PhysicalStatsSection({ profile, isEditing, onChange, onQuickSave, isSavingField }: PhysicalStatsSectionProps) {
  const { t } = useTranslation();
  const genderOptions = GENDER_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));
  const bodyTypeOptions = BODY_TYPE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));

  const [activeField, setActiveField] = useState<QuickField>(null);
  const [numberDraft, setNumberDraft] = useState(0);

  const openNumberField = (field: QuickField, current: number) => {
    setNumberDraft(current);
    setActiveField(field);
  };

  const saveNumberField = async () => {
    if (!activeField) return;
    const ok = await onQuickSave({ [activeField]: numberDraft });
    if (ok) setActiveField(null);
  };

  if (!isEditing) {
    const genderLabel = genderOptions.find((o) => o.value === profile.gender)?.label ?? '—';
    const bodyTypeLabel = bodyTypeOptions.find((o) => o.value === profile.body_type)?.label ?? '—';
    return (
      <>
      <ProfileGroup title={t('profile.physicalStats.title')}>
        {/* The three numbers people actually glance at, front and center —
            same big-number treatment as WorkoutHistorySection — instead of
            just another label/value row like everything below it. */}
        <View className="flex-row px-4 py-4">
          <NumberCell
            value={profile.age ? `${profile.age}` : '—'}
            label={t('profile.physicalStats.age')}
            onPress={() => openNumberField('age', profile.age ?? 25)}
          />
          <NumberCell
            value={profile.height_cm ? `${profile.height_cm}` : '—'}
            label={`${t('profile.physicalStats.height')} (cm)`}
            onPress={() => openNumberField('height_cm', profile.height_cm ?? 170)}
          />
          <NumberCell
            value={profile.weight_kg ? `${profile.weight_kg}` : '—'}
            label={`${t('profile.physicalStats.weight')} (kg)`}
            onPress={() => openNumberField('weight_kg', profile.weight_kg ?? 70)}
          />
        </View>
        <ProfileRow
          icon="user"
          accentColor={ACCENT}
          label={t('profile.physicalStats.gender')}
          value={genderLabel}
          onPress={() => setActiveField('gender')}
        />
        <ProfileRow
          icon="activity"
          accentColor={ACCENT}
          label={t('profile.physicalStats.bodyType')}
          value={bodyTypeLabel}
          onPress={() => setActiveField('body_type')}
        />
        {profile.weight_updated_at && (
          <View className="px-4 pb-3 pt-1">
            <Text className="font-body text-small text-secondary-light dark:text-secondary">
              {t('profile.physicalStats.lastUpdated', { date: new Date(profile.weight_updated_at).toLocaleDateString() })}
            </Text>
          </View>
        )}
      </ProfileGroup>

        <QuickEditModal
          visible={activeField === 'age' || activeField === 'height_cm' || activeField === 'weight_kg'}
          title={
            activeField === 'age'
              ? t('profile.physicalStats.age')
              : activeField === 'height_cm'
                ? t('profile.physicalStats.heightCm')
                : t('profile.physicalStats.weightKg')
          }
          isSaving={isSavingField}
          onCancel={() => setActiveField(null)}
          onSave={saveNumberField}
        >
          {activeField === 'age' && <NumberStepperField label={t('profile.physicalStats.age')} value={numberDraft} min={13} max={120} onChange={setNumberDraft} />}
          {activeField === 'height_cm' && (
            <View className="gap-2">
              <NumberStepperField label={t('profile.physicalStats.heightCm')} value={numberDraft} min={100} max={250} onChange={setNumberDraft} />
              <Text className="font-body text-small text-secondary-light dark:text-secondary">≈ {cmToFeetInches(numberDraft)}</Text>
            </View>
          )}
          {activeField === 'weight_kg' && (
            <NumberStepperField
              label={t('profile.physicalStats.weightKg')}
              value={numberDraft}
              min={20}
              max={300}
              step={0.5}
              decimals={1}
              onChange={setNumberDraft}
            />
          )}
        </QuickEditModal>

        <SelectModal
          visible={activeField === 'gender'}
          title={t('profile.physicalStats.gender')}
          options={genderOptions}
          selected={profile.gender}
          onClose={() => setActiveField(null)}
          onSelect={async (gender) => {
            setActiveField(null);
            await onQuickSave({ gender });
          }}
        />
        <SelectModal
          visible={activeField === 'body_type'}
          title={t('profile.physicalStats.bodyType')}
          options={bodyTypeOptions}
          selected={profile.body_type as (typeof BODY_TYPE_OPTIONS)[number]['value'] | null}
          onClose={() => setActiveField(null)}
          onSelect={async (body_type) => {
            setActiveField(null);
            await onQuickSave({ body_type });
          }}
        />
      </>
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
