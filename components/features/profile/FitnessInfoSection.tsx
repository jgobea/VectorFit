import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ProfileGroup } from '@/components/features/profile/ProfileGroup';
import { QuickEditModal } from '@/components/features/profile/QuickEditModal';
import { ProfileRow } from '@/components/features/profile/ProfileRow';
import { ProfileSection } from '@/components/features/profile/ProfileSection';
import { Input } from '@/components/ui/Input';
import { LabeledSlider } from '@/components/ui/LabeledSlider';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SelectField } from '@/components/ui/SelectField';
import { SelectModal } from '@/components/ui/SelectModal';
import { Colors } from '@/constants/theme';
import { EXPERIENCE_OPTIONS, GOAL_OPTIONS } from '@/constants/profileOptions';
import type { UserProfile } from '@/types/user';

interface FitnessInfoSectionProps {
  profile: UserProfile;
  isEditing: boolean;
  onChange: (patch: Partial<UserProfile>) => void;
  onQuickSave: (patch: Partial<UserProfile>) => Promise<boolean>;
  isSavingField: boolean;
}

type QuickField = 'primary_goal' | 'experience_level' | 'workout_frequency_days' | 'injuries_limitations' | null;

const ACCENT = Colors.greenNeon;

export function FitnessInfoSection({ profile, isEditing, onChange, onQuickSave, isSavingField }: FitnessInfoSectionProps) {
  const { t } = useTranslation();
  const goalOptions = GOAL_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));
  const experienceOptions = EXPERIENCE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));

  const [activeField, setActiveField] = useState<QuickField>(null);
  const [frequencyDraft, setFrequencyDraft] = useState(3);
  const [injuriesDraft, setInjuriesDraft] = useState('');

  if (!isEditing) {
    const goalLabel = goalOptions.find((o) => o.value === profile.primary_goal)?.label ?? '—';
    const experienceLabel = experienceOptions.find((o) => o.value === profile.experience_level)?.label ?? '—';
    return (
      <>
      <ProfileGroup title={t('profile.fitnessInfo.title')}>
        <ProfileRow
          icon="flag"
          accentColor={ACCENT}
          label={t('profile.fitnessInfo.primaryGoal')}
          value={goalLabel}
          onPress={() => setActiveField('primary_goal')}
        />
        <ProfileRow
          icon="bar-chart"
          accentColor={ACCENT}
          label={t('profile.fitnessInfo.experienceLevel')}
          value={experienceLabel}
          onPress={() => setActiveField('experience_level')}
        />
        <ProfileRow
          icon="calendar"
          accentColor={ACCENT}
          label={t('profile.fitnessInfo.workoutFrequency')}
          value={profile.workout_frequency_days ? t('profile.fitnessInfo.timesPerWeek', { n: profile.workout_frequency_days }) : '—'}
          onPress={() => {
            setFrequencyDraft(profile.workout_frequency_days ?? 3);
            setActiveField('workout_frequency_days');
          }}
        />
        <ProfileRow
          icon="alert-circle"
          accentColor={ACCENT}
          label={t('profile.fitnessInfo.injuries')}
          value={profile.injuries_limitations || t('profile.fitnessInfo.noneNoted')}
          onPress={() => {
            setInjuriesDraft(profile.injuries_limitations ?? '');
            setActiveField('injuries_limitations');
          }}
        />
      </ProfileGroup>

        <SelectModal
          visible={activeField === 'primary_goal'}
          title={t('profile.fitnessInfo.primaryGoal')}
          options={goalOptions}
          selected={profile.primary_goal}
          onClose={() => setActiveField(null)}
          onSelect={async (primary_goal) => {
            setActiveField(null);
            await onQuickSave({ primary_goal });
          }}
        />
        <SelectModal
          visible={activeField === 'experience_level'}
          title={t('profile.fitnessInfo.experienceLevel')}
          options={experienceOptions}
          selected={profile.experience_level}
          onClose={() => setActiveField(null)}
          onSelect={async (experience_level) => {
            setActiveField(null);
            await onQuickSave({ experience_level });
          }}
        />
        <QuickEditModal
          visible={activeField === 'workout_frequency_days'}
          title={t('profile.fitnessInfo.workoutFrequency')}
          isSaving={isSavingField}
          onCancel={() => setActiveField(null)}
          onSave={async () => {
            const ok = await onQuickSave({ workout_frequency_days: frequencyDraft });
            if (ok) setActiveField(null);
          }}
        >
          <LabeledSlider
            label={t('profile.fitnessInfo.workoutFrequency')}
            value={frequencyDraft}
            min={1}
            max={7}
            step={1}
            formatValue={(v) => t('profile.fitnessInfo.timesPerWeek', { n: Math.round(v) })}
            onChange={(v) => setFrequencyDraft(Math.round(v))}
          />
        </QuickEditModal>
        <QuickEditModal
          visible={activeField === 'injuries_limitations'}
          title={t('profile.fitnessInfo.injuries')}
          isSaving={isSavingField}
          onCancel={() => setActiveField(null)}
          onSave={async () => {
            const ok = await onQuickSave({ injuries_limitations: injuriesDraft });
            if (ok) setActiveField(null);
          }}
        >
          <Input
            label={t('profile.fitnessInfo.injuries')}
            placeholder={t('profile.fitnessInfo.injuriesPlaceholder')}
            value={injuriesDraft}
            onChangeText={setInjuriesDraft}
            multiline
          />
        </QuickEditModal>
      </>
    );
  }

  return (
    <ProfileSection title={t('profile.fitnessInfo.title')} icon="target" accentColor={ACCENT}>
      <SelectField
        label={t('profile.fitnessInfo.primaryGoal')}
        placeholder={t('profile.fitnessInfo.chooseGoal')}
        value={profile.primary_goal}
        options={goalOptions}
        onChange={(primary_goal) => onChange({ primary_goal })}
      />
      <RadioGroup
        label={t('profile.fitnessInfo.experienceLevel')}
        value={profile.experience_level}
        options={experienceOptions}
        onChange={(experience_level) => onChange({ experience_level })}
      />
      <LabeledSlider
        label={t('profile.fitnessInfo.workoutFrequency')}
        value={profile.workout_frequency_days ?? 3}
        min={1}
        max={7}
        step={1}
        formatValue={(v) => t('profile.fitnessInfo.timesPerWeek', { n: Math.round(v) })}
        onChange={(v) => onChange({ workout_frequency_days: Math.round(v) })}
      />
      <Input
        label={t('profile.fitnessInfo.injuries')}
        placeholder={t('profile.fitnessInfo.injuriesPlaceholder')}
        value={profile.injuries_limitations ?? ''}
        onChangeText={(injuries_limitations) => onChange({ injuries_limitations })}
        multiline
      />
    </ProfileSection>
  );
}
