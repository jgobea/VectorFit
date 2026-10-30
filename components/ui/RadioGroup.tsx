import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { OptionHelpButton } from '@/components/ui/OptionHelpButton';

interface RadioOption<T extends string> {
  value: T;
  label: string;
  /** Short explanation shown under the label, inside the same card. */
  description?: string;
  /** Longer explanation behind a help button at the card's right edge. */
  help?: { title: string; message: string };
}

interface RadioGroupProps<T extends string> {
  label: string;
  value: T | null;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
}

// DESIGN_SPEC.md §E.2-3-5: "Radio buttons" for gender, experience level,
// coaching style — one selection, all options visible at once (no modal),
// since these lists only ever have 3-4 short entries.
export function RadioGroup<T extends string>({ label, value, options, onChange }: RadioGroupProps<T>) {
  return (
    <View className="gap-2">
      <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">{label}</Text>
      <View className="gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Card
              key={option.value}
              onPress={() => onChange(option.value)}
              className={`flex-row items-center gap-3 ${selected ? 'border-cyan-vivid' : ''}`}
            >
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  selected ? 'border-cyan-vivid' : 'border-border-light dark:border-border'
                }`}
              >
                {selected && <View className="h-2.5 w-2.5 rounded-full bg-cyan-vivid" />}
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="font-body-medium text-body text-primary-light dark:text-primary">{option.label}</Text>
                {!!option.description && (
                  <Text className="font-body text-small text-secondary-light dark:text-secondary">{option.description}</Text>
                )}
              </View>
              {option.help && <OptionHelpButton title={option.help.title} message={option.help.message} />}
            </Card>
          );
        })}
      </View>
    </View>
  );
}
