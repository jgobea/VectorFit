import { Text, TextInput, View } from 'react-native';

interface CompactNumberFieldProps {
  label: string;
  value: number | null;
  min?: number;
  decimals?: number;
  onChange: (value: number | null) => void;
}

// A narrower cousin of NumberStepperField, no +/- buttons — for dense
// grids like the routine builder's per-exercise sets/reps/weight/rest row,
// where four full steppers side by side wouldn't fit.
export function CompactNumberField({ label, value, min, decimals = 0, onChange }: CompactNumberFieldProps) {
  const handleChangeText = (text: string) => {
    const pattern = decimals > 0 ? /[^0-9.]/g : /[^0-9]/g;
    const cleaned = text.replace(pattern, '');
    if (cleaned === '' || cleaned === '.') {
      onChange(null);
      return;
    }
    const parsed = parseFloat(cleaned);
    if (!Number.isNaN(parsed)) onChange(min != null ? Math.max(min, parsed) : parsed);
  };

  return (
    <View className="flex-1 gap-1">
      <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">{label}</Text>
      <TextInput
        value={value == null ? '' : String(value)}
        onChangeText={handleChangeText}
        placeholder="—"
        placeholderTextColor="#A0A0A8"
        keyboardType="decimal-pad"
        inputMode="decimal"
        maxLength={5}
        style={{ textAlignVertical: 'center', paddingVertical: 0 }}
        className="h-10 rounded-lg border border-border-light text-center font-body-semibold text-small text-primary-light dark:border-border dark:text-primary"
      />
    </View>
  );
}
