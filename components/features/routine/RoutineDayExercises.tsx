import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ExercisePickerModal } from '@/components/features/ExercisePickerModal';
import { DayVolumeSummary } from '@/components/features/routine/DayVolumeSummary';
import { DraggableExerciseList } from '@/components/features/routine/DraggableExerciseList';
import { RoutineExerciseCard } from '@/components/features/routine/RoutineExerciseCard';
import { useAllExercises } from '@/hooks/useAllExercises';
import { useRoutineExerciseActions } from '@/hooks/useRoutineExerciseActions';
import { useAuthStore } from '@/stores/authStore';
import type { RoutineDay, RoutineExercise } from '@/types/routine';

interface RoutineDayExercisesProps {
  day: RoutineDay;
}

export function RoutineDayExercises({ day }: RoutineDayExercisesProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { exercises, isLoading, error, createCustomExercise, deleteCustomExercise } = useAllExercises();
  const { addExercise, updateExercise, removeExercise, reorderExercises } = useRoutineExerciseActions();

  const patchOf =
    (exerciseId: string) =>
    (patch: Partial<Pick<RoutineExercise, 'sets' | 'reps' | 'weight_kg' | 'duration_seconds' | 'rest_seconds'>>) =>
      updateExercise(exerciseId, patch);

  return (
    <View className="gap-3">
      <DayVolumeSummary exercises={day.exercises} />

      <DraggableExerciseList
        items={day.exercises}
        onReorder={(orderedIds) => reorderExercises(day.id, orderedIds)}
        renderItem={(exercise, dragHandle) => (
          <RoutineExerciseCard
            exercise={exercise}
            dragHandle={dragHandle}
            onChange={patchOf(exercise.id)}
            onRemove={() => removeExercise(day.id, exercise.id)}
          />
        )}
      />

      <Pressable
        onPress={() => setPickerOpen(true)}
        accessibilityRole="button"
        className="h-14 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-vivid/50 active:opacity-70"
      >
        <Feather name="plus" size={18} color="#00E5FF" />
        <Text className="font-body-semibold text-body text-cyan-vivid">Add Exercise</Text>
      </Pressable>

      <ExercisePickerModal
        visible={pickerOpen}
        exercises={exercises}
        isLoading={isLoading}
        error={error}
        currentUserId={userId}
        onCreateCustom={(name, measurementType, timeMode) => createCustomExercise(name, null, measurementType, timeMode)}
        onDeleteCustom={deleteCustomExercise}
        onClose={() => setPickerOpen(false)}
        onSelect={(exercise) => {
          addExercise(day.id, exercise);
          setPickerOpen(false);
        }}
      />
    </View>
  );
}
