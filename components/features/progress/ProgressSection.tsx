import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';

interface ProgressSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// One Card per chart/stat group — same "titled card" shell as
// components/features/profile/ProfileSection.tsx, kept as its own copy
// since this page's sections carry an optional subtitle line the profile
// one doesn't need.
export function ProgressSection({ title, subtitle, children }: ProgressSectionProps) {
  return (
    <Card className="gap-4">
      <View className="gap-1">
        <Text className="font-display text-h3 text-primary-light dark:text-primary">{title}</Text>
        {subtitle && (
          <Text className="font-body text-small text-secondary-light dark:text-secondary">{subtitle}</Text>
        )}
      </View>
      {children}
    </Card>
  );
}
