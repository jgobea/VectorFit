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
  return (
    <View className="gap-6">
      <Input label="Name" placeholder="Your name" value={draft.full_name} onChangeText={(full_name) => onChange({ full_name })} />
      <NumberStepperField label="Age" value={draft.age} min={13} max={120} onChange={(age) => onChange({ age })} />
      <RadioGroup label="Gender" value={draft.gender} options={GENDER_OPTIONS} onChange={(gender) => onChange({ gender })} />
    </View>
  );
}
