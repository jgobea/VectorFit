import { FlashList } from '@shopify/flash-list';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { UpcomingWorkoutRow } from '@/components/features/UpcomingWorkoutRow';
import type { Workout } from '@/types/workout';

interface UpcomingWorkoutsListProps {
  workouts: Workout[];
}

// DESIGN_SPEC.md §B.4: vertical list of workouts for next 3-7 days.
export function UpcomingWorkoutsList({ workouts }: UpcomingWorkoutsListProps) {
  if (workouts.length === 0) {
    return (
      <Card className="items-center gap-1 py-6">
        <Text className="font-body text-body text-secondary-light dark:text-secondary">
          No workouts planned for the rest of the week yet.
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <View style={{ minHeight: workouts.length * 60 }}>
        <FlashList
          data={workouts}
          renderItem={({ item }) => <UpcomingWorkoutRow workout={item} />}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    </Card>
  );
}
