import { Feather } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ExerciseIconPickerModal } from '@/components/features/routine/ExerciseIconPickerModal';
import { Card } from '@/components/ui/Card';
import { CompactNumberField } from '@/components/ui/CompactNumberField';
import { DEFAULT_EXERCISE_ICON, isExerciseIconName, type ExerciseIconName } from '@/constants/exerciseIcons';
import type { RoutineExercise } from '@/types/routine';

interface RoutineExerciseCardProps {
  exercise: RoutineExercise;
  dragHandle: ReactNode;
  onChange: (
    patch: Partial<Pick<RoutineExercise, 'sets' | 'reps' | 'weight_kg' | 'duration_seconds' | 'rest_seconds' | 'icon'>>
  ) => void;
  onRemove: () => void;
}

// Compact per-exercise card: icon + name + drag handle/remove up top, a
// 4-column sets/reps/weight/rest grid below — DESIGN_SPEC.md's "compact
// grid" ask, simplified to one aggregate row per exercise rather than one
// row per set. Reordering itself is handled by the parent
// DraggableExerciseList, which owns the gesture and hands us back a
// ready-to-render handle.
export function RoutineExerciseCard({ exercise, dragHandle, onChange, onRemove }: RoutineExerciseCardProps) {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const icon: ExerciseIconName = isExerciseIconName(exercise.icon) ? exercise.icon : DEFAULT_EXERCISE_ICON;
  const isTimeBased = exercise.exercise?.measurement_type === 'time';

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2 pr-2">
          <Pressable
            onPress={() => setIconPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Change exercise icon"
            className="h-9 w-9 items-center justify-center rounded-full bg-cyan-vivid/10 active:opacity-70"
          >
            <Feather name={icon} size={16} color="#00E5FF" />
            <View className="absolute -bottom-0.5 -right-0.5 h-4 w-4 items-center justify-center rounded-full border border-surface-light bg-cyan-vivid dark:border-surface">
              <Feather name="edit-2" size={8} color="#1C1C1E" />
            </View>
          </Pressable>
          <Text className="flex-1 font-body-semibold text-body text-primary-light dark:text-primary" numberOfLines={1}>
            {exercise.exercise?.name ?? 'Exercise'}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          {dragHandle}
          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel="Remove exercise"
            hitSlop={6}
            className="h-8 w-8 items-center justify-center rounded-lg active:opacity-70"
          >
            <Feather name="trash-2" size={16} color="#FF3B30" />
          </Pressable>
        </View>
      </View>

      <View className="flex-row gap-2">
        <CompactNumberField label="Sets" value={exercise.sets} min={1} required onChange={(sets) => onChange({ sets })} />
        {isTimeBased ? (
          <CompactNumberField
            label="Sec"
            value={exercise.duration_seconds}
            min={1}
            onChange={(duration_seconds) => onChange({ duration_seconds })}
          />
        ) : (
          <>
            <CompactNumberField label="Reps" value={exercise.reps} onChange={(reps) => onChange({ reps })} />
            <CompactNumberField
              label="Kg"
              value={exercise.weight_kg}
              decimals={1}
              onChange={(weight_kg) => onChange({ weight_kg })}
            />
          </>
        )}
        <CompactNumberField
          label="Rest s"
          value={exercise.rest_seconds}
          onChange={(rest_seconds) => onChange({ rest_seconds })}
        />
      </View>

      <ExerciseIconPickerModal
        visible={iconPickerOpen}
        selected={icon}
        onClose={() => setIconPickerOpen(false)}
        onSelect={(selectedIcon) => onChange({ icon: selectedIcon })}
      />
    </Card>
  );
}
