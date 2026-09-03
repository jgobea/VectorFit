import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { Exercise } from '@/types/workout';

interface ExercisePickerRowProps {
  exercise: Exercise;
  isOwnCustom: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

// One row in the picker: name, a "Live Review" badge when the exercise is
// pose-trackable (separates camera-compatible exercises from the rest at a
// glance), and a delete affordance only for exercises the current user
// created themselves.
export function ExercisePickerRow({ exercise, isOwnCustom, onSelect, onDelete }: ExercisePickerRowProps) {
  const { t } = useTranslation();
  return (
    <Card onPress={onSelect} className="flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center gap-2 pr-2">
        <Text className="font-body-semibold text-body text-primary-light dark:text-primary" numberOfLines={1}>
          {exercise.name}
        </Text>
        {exercise.quickpose_feature && (
          <View className="flex-row items-center gap-1 rounded-full bg-cyan-vivid/10 px-2 py-0.5">
            <Feather name="camera" size={10} color="#00E5FF" />
            <Text className="font-body-medium text-small text-cyan-vivid">{t('nav.liveReview')}</Text>
          </View>
        )}
      </View>

      {isOwnCustom && onDelete && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('exercisePicker.deleteExercise', { name: exercise.name })}
          hitSlop={8}
          className="mr-1 h-8 w-8 items-center justify-center rounded-lg active:opacity-70"
        >
          <Feather name="trash-2" size={15} color="#FF3B30" />
        </Pressable>
      )}
      <Feather name="chevron-right" size={20} color="#00E5FF" />
    </Card>
  );
}
