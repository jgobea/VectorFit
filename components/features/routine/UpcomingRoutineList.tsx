import { FlashList } from '@shopify/flash-list';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { UpcomingRoutineDayRow } from '@/components/features/routine/UpcomingRoutineDayRow';
import type { ScheduledDay } from '@/lib/routineSchedule';

interface UpcomingRoutineListProps {
  days: ScheduledDay[];
}

export function UpcomingRoutineList({ days }: UpcomingRoutineListProps) {
  if (days.length === 0) {
    return (
      <Card className="items-center gap-1 py-6">
        <Text className="font-body text-body text-secondary-light dark:text-secondary">
          No days scheduled for the rest of the week yet.
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <View style={{ minHeight: days.length * 60 }}>
        <FlashList
          data={days}
          renderItem={({ item }) => <UpcomingRoutineDayRow scheduled={item} />}
          keyExtractor={(item) => item.day.id}
          scrollEnabled={false}
        />
      </View>
    </Card>
  );
}
