import { useTranslation } from 'react-i18next';

import { ProfileGroup } from '@/components/features/profile/ProfileGroup';
import { ProfileRow } from '@/components/features/profile/ProfileRow';
import { ProfileSection } from '@/components/features/profile/ProfileSection';
import { Input } from '@/components/ui/Input';
import { LabeledSlider } from '@/components/ui/LabeledSlider';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SelectField } from '@/components/ui/SelectField';
import { Colors } from '@/constants/theme';
import { EXPERIENCE_OPTIONS, GOAL_OPTIONS } from '@/constants/profileOptions';
import type { UserProfile } from '@/types/user';

interface FitnessInfoSectionProps {
  profile: UserProfile;
  isEditing: boolean;
  onChange: (patch: Partial<UserProfile>) => void;
}

const ACCENT = Colors.greenNeon;

export function FitnessInfoSection({ profile, isEditing, onChange }: FitnessInfoSectionProps) {
  const { t } = useTranslation();
  const goalOptions = GOAL_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));
  const experienceOptions = EXPERIENCE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));

  if (!isEditing) {
    const goalLabel = goalOptions.find((o) => o.value === profile.primary_goal)?.label ?? '—';
    const experienceLabel = experienceOptions.find((o) => o.value === profile.experience_level)?.label ?? '—';
    return (
      <ProfileGroup title={t('profile.fitnessInfo.title')}>
        <ProfileRow icon="flag" accentColor={ACCENT} label={t('profile.fitnessInfo.primaryGoal')} value={goalLabel} />
        <ProfileRow icon="bar-chart" accentColor={ACCENT} label={t('profile.fitnessInfo.experienceLevel')} value={experienceLabel} />
        <ProfileRow
          icon="calendar"
          accentColor={ACCENT}
          label={t('profile.fitnessInfo.workoutFrequency')}
          value={profile.workout_frequency_days ? t('profile.fitnessInfo.timesPerWeek', { n: profile.workout_frequency_days }) : '—'}
        />
        <ProfileRow
          icon="alert-circle"
          accentColor={ACCENT}
          label={t('profile.fitnessInfo.injuries')}
          value={profile.injuries_limitations || t('profile.fitnessInfo.noneNoted')}
        />
      </ProfileGroup>
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
