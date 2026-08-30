import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { DEFAULT_EXERCISE_ICON, isExerciseIconName } from '@/constants/exerciseIcons';
import type { RoutineExercise } from '@/types/routine';

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#39FF14',
  intermediate: '#FFB800',
  advanced: '#FF3B30',
};

interface RoutineExercisePreviewRowProps {
  item: RoutineExercise;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onStartLiveReview: () => void;
  onStartTimer: () => void;
}

// Today's Workout row: custom (or fallback) icon, sets/reps/weight detail,
// and actions on the right — every exercise gets a manual complete toggle
// (finishing a Live Review session checks it automatically too, but you
// can still mark it done yourself if you did it without the camera), plus
// either a camera button (pose-trackable exercises) or a clock button
// (time-based exercises) — mutually exclusive, since a user-created
// exercise can never claim camera compatibility.
export function RoutineExercisePreviewRow({
  item,
  isCompleted,
  onToggleComplete,
  onStartLiveReview,
  onStartTimer,
}: RoutineExercisePreviewRowProps) {
  const isLiveReviewCompatible = !!item.exercise?.quickpose_feature;
  const isTimeBased = item.exercise?.measurement_type === 'time';
  const icon = isExerciseIconName(item.icon) ? item.icon : DEFAULT_EXERCISE_ICON;
  const detail = item.duration_seconds
    ? `${item.duration_seconds}s`
    : [
        item.sets && `${item.sets} sets`,
        item.reps && `${item.reps} reps`,
        item.weight_kg && `${item.weight_kg} kg`,
      ]
        .filter(Boolean)
        .join(' · ');

  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: (DIFFICULTY_COLOR[item.exercise?.difficulty ?? ''] ?? '#3A3A3E') + '26' }}
      >
        <Feather name={icon} size={15} color={DIFFICULTY_COLOR[item.exercise?.difficulty ?? ''] ?? '#A0A0A8'} />
      </View>

      <View className="flex-1" style={{ opacity: isCompleted ? 0.5 : 1 }}>
        <Text className="font-body-medium text-body text-primary-light dark:text-primary" numberOfLines={1}>
          {item.exercise?.name ?? 'Exercise'}
        </Text>
        {!!detail && <Text className="font-body text-small text-secondary-light dark:text-secondary">{detail}</Text>}
      </View>

      <View className="flex-row items-center gap-2">
        {isLiveReviewCompatible && (
          <Pressable
            onPress={onStartLiveReview}
            accessibilityRole="button"
            accessibilityLabel={`Start ${item.exercise?.name ?? 'exercise'} in Live Review`}
            hitSlop={6}
            className="h-10 w-10 items-center justify-center rounded-full border border-cyan-vivid/40 active:opacity-70"
          >
            <Feather name="camera" size={16} color="#00E5FF" />
          </Pressable>
        )}
        {isTimeBased && (
          <Pressable
            onPress={onStartTimer}
            accessibilityRole="button"
            accessibilityLabel={`Time ${item.exercise?.name ?? 'exercise'}`}
            hitSlop={6}
            className="h-10 w-10 items-center justify-center rounded-full border border-cyan-vivid/40 active:opacity-70"
          >
            <Feather name="clock" size={16} color="#00E5FF" />
          </Pressable>
        )}
        <Pressable
          onPress={onToggleComplete}
          accessibilityRole="button"
          accessibilityLabel={isCompleted ? 'Mark as not done' : 'Mark as done'}
          accessibilityState={{ checked: isCompleted }}
          hitSlop={6}
          className={`h-10 w-10 items-center justify-center rounded-full border active:opacity-70 ${
            isCompleted ? 'border-green-neon bg-green-neon/15' : 'border-border-light dark:border-border'
          }`}
        >
          <Feather name="check" size={18} color={isCompleted ? '#39FF14' : '#A0A0A8'} />
        </Pressable>
      </View>
    </View>
  );
}
