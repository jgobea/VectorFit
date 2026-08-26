import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ExercisePickerModal } from '@/components/features/ExercisePickerModal';
import { DayVolumeSummary } from '@/components/features/routine/DayVolumeSummary';
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
  const { addExercise, updateExercise, removeExercise, moveExercise } = useRoutineExerciseActions();

  const patchOf =
    (exerciseId: string) => (patch: Partial<Pick<RoutineExercise, 'sets' | 'reps' | 'weight_kg' | 'rest_seconds'>>) =>
      updateExercise(exerciseId, patch);

  return (
    <View className="gap-3">
      <DayVolumeSummary exercises={day.exercises} />

      {day.exercises.map((exercise, index) => (
        <RoutineExerciseCard
          key={exercise.id}
          exercise={exercise}
          canMoveUp={index > 0}
          canMoveDown={index < day.exercises.length - 1}
          onChange={patchOf(exercise.id)}
          onMove={(direction) => moveExercise(day.id, exercise.id, direction)}
          onRemove={() => removeExercise(day.id, exercise.id)}
        />
      ))}

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
        onCreateCustom={(name) => createCustomExercise(name, null)}
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
