import { Feather } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

interface NumberStepperFieldProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  /** Amount +/- change per tap, and the rounding granularity for typed input. */
  step?: number;
  /** Decimal places to display/round to — 0 for integer-only fields. */
  decimals?: number;
  onChange: (value: number) => void;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// Shared +/- stepper: reps/sets on Live Review, age/height/weight on User
// Info. Text field restricted to digits (and one decimal point when
// decimals > 0) — no free-typed garbage, per the original Live Review ask.
export function NumberStepperField({
  label,
  value,
  min = 1,
  max = Infinity,
  step = 1,
  decimals = 0,
  onChange,
}: NumberStepperFieldProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, round(n, decimals)));

  const decrement = () => onChange(clamp(value - step));
  const increment = () => onChange(clamp(value + step));

  const handleChangeText = (text: string) => {
    const pattern = decimals > 0 ? /[^0-9.]/g : /[^0-9]/g;
    const cleaned = text.replace(pattern, '');
    if (cleaned === '' || cleaned === '.') return;
    const parsed = parseFloat(cleaned);
    if (Number.isNaN(parsed)) return;
    onChange(clamp(parsed));
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
          value={decimals > 0 ? value.toFixed(decimals) : String(value)}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          inputMode="decimal"
          maxLength={6}
          // Android's TextInput ships with built-in vertical padding that
          // clips a tall/bold digit against a fixed h-11 box — text-center
          // alone doesn't fix vertical alignment, only horizontal.
          style={{ textAlignVertical: 'center', paddingVertical: 0 }}
          className="h-11 w-20 rounded-xl border border-border-light text-center font-body-semibold text-body text-primary-light dark:border-border dark:text-primary"
        />

        <Pressable
          onPress={increment}
          disabled={value >= max}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label.toLowerCase()}`}
          className="h-11 w-11 items-center justify-center rounded-xl border border-border-light active:opacity-70 disabled:opacity-30 dark:border-border"
        >
          <Feather name="plus" size={18} color="#00E5FF" />
        </Pressable>
      </View>
    </View>
  );
}
