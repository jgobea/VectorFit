import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { WorkoutExercise } from '@/types/workout';

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#39FF14',
  intermediate: '#FFB800',
  advanced: '#FF3B30',
};

interface ExercisePreviewRowProps {
  item: WorkoutExercise;
}

// DESIGN_SPEC.md §B.3: exercise name, sets/reps/duration, difficulty dot.
export function ExercisePreviewRow({ item }: ExercisePreviewRowProps) {
  const detail = item.duration_seconds
    ? `${item.duration_seconds}s`
    : [item.sets && `${item.sets} sets`, item.reps && `${item.reps} reps`].filter(Boolean).join(' · ');

  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: (DIFFICULTY_COLOR[item.exercise?.difficulty ?? ''] ?? '#3A3A3E') + '26' }}
      >
        <Feather name="activity" size={15} color={DIFFICULTY_COLOR[item.exercise?.difficulty ?? ''] ?? '#A0A0A8'} />
      </View>
      <View className="flex-1">
        <Text className="font-body-medium text-body text-primary-light dark:text-primary" numberOfLines={1}>
          {item.exercise?.name ?? 'Exercise'}
        </Text>
        {!!detail && (
          <Text className="font-body text-small text-secondary-light dark:text-secondary">{detail}</Text>
        )}
      </View>
    </View>
  );
}
