import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { RadioGroup } from '@/components/ui/RadioGroup';
import { NumberStepperField } from '@/components/ui/NumberStepperField';
import { Input } from '@/components/ui/Input';
import { GENDER_OPTIONS } from '@/constants/profileOptions';
import type { OnboardingDraft } from '@/types/onboarding';

interface StepProps {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}

export function AboutYouStep({ draft, onChange }: StepProps) {
  const { t } = useTranslation();
  const genderOptions = GENDER_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));
  return (
    <View className="gap-6">
      <Input
        label={t('onboarding.aboutYou.nameLabel')}
        placeholder={t('profile.header.namePlaceholder')}
        value={draft.full_name}
        onChangeText={(full_name) => onChange({ full_name })}
      />
      <NumberStepperField label={t('profile.physicalStats.age')} value={draft.age} min={13} max={120} onChange={(age) => onChange({ age })} />
      <RadioGroup label={t('profile.physicalStats.gender')} value={draft.gender} options={genderOptions} onChange={(gender) => onChange({ gender })} />
    </View>
  );
}
