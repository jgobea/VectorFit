import { Switch, Text, View } from 'react-native';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-body-medium text-body text-primary-light dark:text-primary">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#3A3A3E', true: '#00E5FF' }}
        thumbColor="#FFFFFF"
        accessibilityLabel={label}
      />
    </View>
  );
}
