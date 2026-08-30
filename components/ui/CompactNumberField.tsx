import { Text, TextInput, View } from 'react-native';

interface CompactNumberFieldProps {
  label: string;
  value: number | null;
  min?: number;
  decimals?: number;
  /** Snaps back to `min` (or 1) on blur instead of being left empty/null — for fields like Sets that can't be meaningfully unset. */
  required?: boolean;
  onChange: (value: number | null) => void;
}

// A narrower cousin of NumberStepperField, no +/- buttons — for dense
// grids like the routine builder's per-exercise sets/reps/weight/rest row,
// where four full steppers side by side wouldn't fit.
export function CompactNumberField({ label, value, min, decimals = 0, required, onChange }: CompactNumberFieldProps) {
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

  // Blank is fine mid-edit (so backspacing to retype works), but a required
  // field can't be left that way — every keystroke already autosaves, so an
  // abandoned blank field would otherwise persist as null.
  const handleBlur = () => {
    if (required && value == null) onChange(min ?? 1);
  };

  return (
    <View className="flex-1 gap-1">
      <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">{label}</Text>
      <TextInput
        value={value == null ? '' : String(value)}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
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
