import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

import { ExerciseDemoContent } from '@/components/features/ExerciseDemoContent';
import { translateExerciseName } from '@/constants/exerciseCatalog';
import type { Exercise } from '@/types/workout';

interface ExerciseDemoModalProps {
  exercise: Pick<Exercise, 'name' | 'image_url' | 'instructions'> | null;
  onClose: () => void;
}

// "Demonstration: <exercise>" dialog, opened from the help button on a
// routine exercise (RoutineExerciseCard in the builder,
// RoutineExercisePreviewRow on the Dashboard). Same shell as InfoModal.
export function ExerciseDemoModal({ exercise, onClose }: ExerciseDemoModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={!!exercise} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm gap-4 rounded-2xl border border-border-light bg-surface-light p-card dark:border-border dark:bg-surface"
        >
          {exercise && (
            <>
              <View className="flex-row items-start justify-between gap-3">
                <Text className="flex-1 font-display text-h3 text-primary-light dark:text-primary">
                  {t('exercises.demo.title', { name: translateExerciseName(t, exercise.name) })}
                </Text>
                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel={t('exercises.demo.close')}
                  hitSlop={8}
                  className="h-8 w-8 items-center justify-center rounded-full active:opacity-70"
                >
                  <Feather name="x" size={20} color="#A0A0A8" />
                </Pressable>
              </View>
              <ExerciseDemoContent exercise={exercise} onAskTrainer={onClose} />
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
