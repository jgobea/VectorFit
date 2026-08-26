import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';

interface ProfileSectionProps {
  title: string;
  children: ReactNode;
}

// DESIGN_SPEC.md §E "Organized sections with clear dividers" — every
// section on this page is one Card with a heading, shared here so the six
// sections don't each repeat the same title markup.
export function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <Card className="gap-4">
      <Text className="font-display text-h3 text-primary-light dark:text-primary">{title}</Text>
      <View className="gap-4">{children}</View>
    </Card>
  );
}
