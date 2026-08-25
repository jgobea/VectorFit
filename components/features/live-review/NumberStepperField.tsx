import { Feather } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

interface NumberStepperFieldProps {
  label: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
}

// Reps/Sets input: +/- buttons plus a text field restricted to whole
// numbers — per explicit user request, not a free-text field.
export function NumberStepperField({ label, value, min = 1, onChange }: NumberStepperFieldProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(value + 1);

  const handleChangeText = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    if (digitsOnly === '') return;
    onChange(Math.max(min, parseInt(digitsOnly, 10)));
  };

  return (
    <View className="gap-2">
      <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">{label}</Text>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={decrement}
          disabled={value <= min}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label.toLowerCase()}`}
          className="h-11 w-11 items-center justify-center rounded-xl border border-border-light active:opacity-70 disabled:opacity-30 dark:border-border"
        >
          <Feather name="minus" size={18} color="#00E5FF" />
        </Pressable>

        <TextInput
          value={String(value)}
          onChangeText={handleChangeText}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={3}
          // Android's TextInput ships with built-in vertical padding that
          // clips a tall/bold digit against a fixed h-11 box — text-center
          // alone doesn't fix vertical alignment, only horizontal.
          style={{ textAlignVertical: 'center', paddingVertical: 0 }}
          className="h-11 w-16 rounded-xl border border-border-light text-center font-body-semibold text-body text-primary-light dark:border-border dark:text-primary"
        />

        <Pressable
          onPress={increment}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label.toLowerCase()}`}
          className="h-11 w-11 items-center justify-center rounded-xl border border-border-light active:opacity-70 dark:border-border"
        >
          <Feather name="plus" size={18} color="#00E5FF" />
        </Pressable>
      </View>
    </View>
  );
}
