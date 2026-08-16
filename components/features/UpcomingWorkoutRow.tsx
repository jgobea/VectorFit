import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Workout } from '@/types/workout';

interface UpcomingWorkoutRowProps {
  workout: Workout;
}

function formatDayLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

// DESIGN_SPEC.md §B.4: date label + collapsed/expandable preview per day.
export function UpcomingWorkoutRow({ workout }: UpcomingWorkoutRowProps) {
  const [expanded, setExpanded] = useState(false);
  const exercises = workout.exercises ?? [];
  const preview = exercises
    .slice(0, 3)
    .map((e) => e.exercise?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      className="border-b border-border-light py-3.5 active:opacity-70 dark:border-border"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="font-body-medium text-small text-cyan-vivid">
            {workout.scheduled_date ? formatDayLabel(workout.scheduled_date) : 'Unscheduled'}
          </Text>
          <Text className="mt-0.5 font-body-medium text-body text-primary-light dark:text-primary" numberOfLines={1}>
            {workout.name}
          </Text>
          {!expanded && !!preview && (
            <Text className="mt-0.5 font-body text-small text-secondary-light dark:text-secondary" numberOfLines={1}>
              {preview}
            </Text>
          )}
        </View>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#A0A0A8" />
      </View>

      {expanded && (
        <View className="mt-2 gap-1">
          {exercises.length === 0 && (
            <Text className="font-body text-small text-secondary-light dark:text-secondary">
              No exercises added yet.
            </Text>
          )}
          {exercises.map((e) => (
            <Text key={e.id} className="font-body text-small text-secondary-light dark:text-secondary">
              • {e.exercise?.name ?? 'Exercise'}
              {e.sets && e.reps ? ` — ${e.sets}×${e.reps}` : ''}
            </Text>
          ))}
        </View>
      )}
    </Pressable>
  );
}
