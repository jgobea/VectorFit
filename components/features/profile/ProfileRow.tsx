import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface ProfileRowProps {
  icon: keyof typeof Feather.glyphMap;
  accentColor: string;
  label: string;
  value?: string;
  /** For a custom right-side control (e.g. LanguageSwitch) instead of plain value text. */
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}

// One row inside a ProfileGroup — small colored icon square, label, and
// either a value/custom control on the right or, when pressable, a chevron.
export function ProfileRow({ icon, accentColor, label, value, right, onPress, destructive }: ProfileRowProps) {
  const color = destructive ? '#FF3B30' : accentColor;

  const content = (
    <View className="flex-row items-center gap-3 px-4 py-3.5">
      <View className="h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1A` }}>
        <Feather name={icon} size={14} color={color} />
      </View>
      <Text
        className={`flex-1 font-body text-body ${destructive ? 'text-error' : 'text-primary-light dark:text-primary'}`}
        numberOfLines={1}
      >
        {label}
      </Text>
      {right ??
        (value != null && (
          <Text className="font-body text-body text-secondary-light dark:text-secondary" numberOfLines={1}>
            {value}
          </Text>
        ))}
      {onPress && !right && <Feather name="chevron-right" size={18} color="#A0A0A8" style={{ marginLeft: -4 }} />}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="active:opacity-60">
      {content}
    </Pressable>
  );
}
