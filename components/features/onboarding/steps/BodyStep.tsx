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
  return (
    <View className="gap-6">
      <View className="gap-1">
        <NumberStepperField
          label="Height (cm)"
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
        label="Weight (kg)"
        value={draft.weight_kg}
        min={20}
        max={300}
        step={0.5}
        decimals={1}
        onChange={(weight_kg) => onChange({ weight_kg })}
      />

      <RadioGroup
        label="Body type"
        value={draft.body_type as (typeof BODY_TYPE_OPTIONS)[number]['value'] | null}
        options={BODY_TYPE_OPTIONS}
        onChange={(body_type) => onChange({ body_type })}
      />
    </View>
  );
}
