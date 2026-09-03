import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { NumberStepperField } from '@/components/ui/NumberStepperField';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { BODY_TYPE_OPTIONS } from '@/constants/profileOptions';
import { cmToFeetInches } from '@/lib/units';
import type { OnboardingDraft } from '@/types/onboarding';

interface StepProps {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}

export function BodyStep({ draft, onChange }: StepProps) {
  const { t } = useTranslation();
  const bodyTypeOptions = BODY_TYPE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }));
  return (
    <View className="gap-6">
      <View className="gap-1">
        <NumberStepperField
          label={t('profile.physicalStats.heightCm')}
          value={draft.height_cm}
          min={100}
          max={250}
          onChange={(height_cm) => onChange({ height_cm })}
        />
        <Text className="font-body text-small text-secondary-light dark:text-secondary">
          ≈ {cmToFeetInches(draft.height_cm)}
        </Text>
      </View>

      <NumberStepperField
        label={t('profile.physicalStats.weightKg')}
        value={draft.weight_kg}
        min={20}
        max={300}
        step={0.5}
        decimals={1}
        onChange={(weight_kg) => onChange({ weight_kg })}
      />

      <RadioGroup
        label={t('profile.physicalStats.bodyType')}
        value={draft.body_type as (typeof BODY_TYPE_OPTIONS)[number]['value'] | null}
        options={bodyTypeOptions}
        onChange={(body_type) => onChange({ body_type })}
      />
    </View>
  );
}
