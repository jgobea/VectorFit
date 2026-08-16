import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExercisePreviewRow } from '@/components/features/ExercisePreviewRow';
import type { Workout } from '@/types/workout';

interface TodaysWorkoutSectionProps {
  workout: Workout | null;
}

// DESIGN_SPEC.md §B.3: today's scheduled workout, exercise previews,
// estimated duration, large Start Workout CTA. Empty state teaches the
// interface rather than showing a bare "nothing here" (anti-ui-slop
// product module: empty states should teach, not go blank).
export function TodaysWorkoutSection({ workout }: TodaysWorkoutSectionProps) {
  const router = useRouter();

  if (!workout) {
    return (
      <Card className="items-center gap-2 py-8">
        <Feather name="moon" size={22} color="#A0A0A8" />
        <Text className="font-display text-h3 text-primary-light dark:text-primary">Rest day</Text>
        <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">
          Nothing scheduled for today. Chat with your trainer to plan one.
        </Text>
      </Card>
    );
  }

  const exercises = workout.exercises ?? [];

  return (
    <Card>
      <View className="mb-1 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="font-display text-h3 text-primary-light dark:text-primary">{workout.name}</Text>
          {workout.estimated_duration_minutes != null && (
            <Text className="mt-1 font-body text-small text-secondary-light dark:text-secondary">
              ~{workout.estimated_duration_minutes} min · {exercises.length} exercises
            </Text>
          )}
        </View>
      </View>

      <View className="h-px bg-border-light dark:bg-border" />

      <View style={{ minHeight: exercises.length * 52 }}>
        <FlashList
          data={exercises}
          renderItem={({ item }) => <ExercisePreviewRow item={item} />}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      <View className="mt-4">
        <Button label="Start Workout" onPress={() => router.push('/(app)/live-review')} />
      </View>
    </Card>
  );
}
