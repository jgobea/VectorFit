import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ExerciseIconPickerModal } from '@/components/features/routine/ExerciseIconPickerModal';
import { Card } from '@/components/ui/Card';
import { CompactNumberField } from '@/components/ui/CompactNumberField';
import { DEFAULT_EXERCISE_ICON, isExerciseIconName, type ExerciseIconName } from '@/constants/exerciseIcons';
import type { RoutineExercise } from '@/types/routine';

interface RoutineExerciseCardProps {
  exercise: RoutineExercise;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (patch: Partial<Pick<RoutineExercise, 'sets' | 'reps' | 'weight_kg' | 'rest_seconds' | 'icon'>>) => void;
  onMove: (direction: 'up' | 'down') => void;
  onRemove: () => void;
}

// Compact per-exercise card: icon + name + reorder/remove up top, a
// 4-column sets/reps/weight/rest grid below — DESIGN_SPEC.md's "compact
// grid" ask, simplified to one aggregate row per exercise rather than one
// row per set.
export function RoutineExerciseCard({ exercise, canMoveUp, canMoveDown, onChange, onMove, onRemove }: RoutineExerciseCardProps) {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const icon: ExerciseIconName = isExerciseIconName(exercise.icon) ? exercise.icon : DEFAULT_EXERCISE_ICON;

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
          </Pressable>
          <Text className="flex-1 font-body-semibold text-body text-primary-light dark:text-primary" numberOfLines={1}>
            {exercise.exercise?.name ?? 'Exercise'}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={() => onMove('up')}
            disabled={!canMoveUp}
            accessibilityRole="button"
            accessibilityLabel="Move up"
            hitSlop={6}
            className="h-8 w-8 items-center justify-center rounded-lg active:opacity-70 disabled:opacity-30"
          >
            <Feather name="chevron-up" size={18} color="#A0A0A8" />
          </Pressable>
          <Pressable
            onPress={() => onMove('down')}
            disabled={!canMoveDown}
            accessibilityRole="button"
            accessibilityLabel="Move down"
            hitSlop={6}
            className="h-8 w-8 items-center justify-center rounded-lg active:opacity-70 disabled:opacity-30"
          >
            <Feather name="chevron-down" size={18} color="#A0A0A8" />
          </Pressable>
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
        <CompactNumberField label="Sets" value={exercise.sets} min={1} onChange={(sets) => onChange({ sets })} />
        <CompactNumberField label="Reps" value={exercise.reps} onChange={(reps) => onChange({ reps })} />
        <CompactNumberField
          label="Kg"
          value={exercise.weight_kg}
          decimals={1}
          onChange={(weight_kg) => onChange({ weight_kg })}
        />
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
