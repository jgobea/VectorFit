import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';

interface ProfileSectionProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  /** Hex — tints this section's icon badge. */
  accentColor: string;
  children: ReactNode;
}

// Every section used to be an identical gray Card with just a plain title —
// per explicit user request, a colored icon badge gives each one its own
// visual identity so the page reads as more than a stack of lookalike cards.
export function ProfileSection({ title, icon, accentColor, children }: ProfileSectionProps) {
  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-3">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accentColor}1A` }}
        >
          <Feather name={icon} size={16} color={accentColor} />
        </View>
        <Text className="flex-1 font-display text-h3 text-primary-light dark:text-primary">{title}</Text>
      </View>
      <View className="gap-4">{children}</View>
    </Card>
  );
}
