import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { translateExerciseName } from '@/constants/exerciseCatalog';
import type { RoutineExercise } from '@/types/routine';

interface FinishDayModalProps {
  visible: boolean;
  exercises: RoutineExercise[];
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// Confirms the full list of what got done today before writing
// routine_day_completions — same shell as ConfirmModal, but with a
// checklist body instead of a single message.
export function FinishDayModal({ visible, exercises, isSubmitting, onCancel, onConfirm }: FinishDayModalProps) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onCancel}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm gap-4 rounded-2xl border border-border-light bg-surface-light p-card dark:border-border dark:bg-surface"
        >
          <Text className="font-display text-h3 text-primary-light dark:text-primary">{t('dashboard.today.finishModalTitle')}</Text>
          <Text className="font-body text-body text-secondary-light dark:text-secondary">{t('dashboard.today.finishModalSubtitle')}</Text>

          <ScrollView style={{ maxHeight: 200 }}>
            <View className="gap-1.5">
              {exercises.map((e) => (
                <Text key={e.id} className="font-body text-body text-primary-light dark:text-primary">
                  • {translateExerciseName(t, e.exercise?.name)}
                </Text>
              ))}
            </View>
          </ScrollView>

          <View className="flex-row gap-3 pt-2">
            <View className="flex-1">
              <Button label={t('common.cancel')} variant="secondary" onPress={onCancel} />
            </View>
            <View className="flex-1">
              <Button label={t('common.confirm')} loading={isSubmitting} onPress={onConfirm} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
