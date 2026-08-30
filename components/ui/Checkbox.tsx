import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onToggle: (next: boolean) => void;
}

export function Checkbox({ label, checked, onToggle }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onToggle(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={8}
      className="flex-row items-center gap-2 active:opacity-70"
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded border ${
          checked ? 'border-cyan-vivid bg-cyan-vivid' : 'border-border-light dark:border-border'
        }`}
      >
        {checked && <Feather name="check" size={14} color="#1C1C1E" />}
      </View>
      {label && <Text className="font-body text-body text-secondary-light dark:text-secondary">{label}</Text>}
    </Pressable>
  );
}
