import { Feather } from '@expo/vector-icons';
import { Text } from 'react-native';

import { Card } from '@/components/ui/Card';

// Illustrated rest-day state — DESIGN_SPEC's "active recovery or full
// rest" edge case.
export function RestDayPanel() {
  return (
    <Card className="items-center gap-3 py-8">
      <Feather name="moon" size={24} color="#A0A0A8" />
      <Text className="font-display text-h3 text-primary-light dark:text-primary">Rest Day</Text>
      <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">
        Active recovery or full rest — no exercises needed today.
      </Text>
    </Card>
  );
}
