import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { SelectModal, type SelectOption } from '@/components/ui/SelectModal';

interface SelectFieldProps<T extends string> {
  label: string;
  placeholder: string;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}

// Dropdown trigger + its own modal state — DESIGN_SPEC.md's "Dropdown
// selections for categorized data" interaction, used for Primary Goal,
// Language, and Training Time (no free typing, per the Live Review
// precedent this session established for pickers of this shape).
export function SelectField<T extends string>({ label, placeholder, value, options, onChange }: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View className="gap-2">
      <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">{label}</Text>
      <Card onPress={() => setOpen(true)} className="flex-row items-center justify-between">
        <Text
          className={`font-body-semibold text-body ${
            current ? 'text-primary-light dark:text-primary' : 'text-secondary-light dark:text-secondary'
          }`}
        >
          {current?.label ?? placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color="#00E5FF" />
      </Card>

      <SelectModal
        visible={open}
        title={label}
        options={options}
        selected={value}
        onClose={() => setOpen(false)}
        onSelect={(next) => {
          onChange(next);
          setOpen(false);
        }}
      />
    </View>
  );
}
