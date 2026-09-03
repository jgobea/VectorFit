import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { InfoModal } from '@/components/ui/InfoModal';
import { useAddSuggestedExercise } from '@/hooks/useAddSuggestedExercise';
import type { SuggestedExercise } from '@/lib/exerciseSuggestion';

interface AddToRoutineModalProps {
  exercise: SuggestedExercise;
  onClose: () => void;
}

// Same sizing reasoning as ExercisePickerModal — a percentage max-height
// nested inside two Pressables doesn't reliably resolve on Android.
const SHEET_MAX_HEIGHT = Dimensions.get('window').height * 0.7;

// Only mounted while a suggestion card's "Add to routine" is actually
// tapped (see ChatBubble.tsx) — mounting this unconditionally per chat
// bubble would fire useRoutine()'s fetch once per past exercise-suggestion
// message just from opening Chat.
export function AddToRoutineModal({ exercise, onClose }: AddToRoutineModalProps) {
  const { t } = useTranslation();
  const daysFull = t('common.daysFull', { returnObjects: true }) as string[];
  const { routine, isLoading, addToDay } = useAddSuggestedExercise();
  const [addingDayId, setAddingDayId] = useState<string | null>(null);
  const [addedDayLabel, setAddedDayLabel] = useState<string | null>(null);
  const todayDow = new Date().getDay();

  const handlePick = async (dayId: string, label: string) => {
    if (addingDayId) return;
    setAddingDayId(dayId);
    const success = await addToDay(exercise, dayId);
    setAddingDayId(null);
    if (success) setAddedDayLabel(label);
  };

  return (
    <>
      <Modal visible={!addedDayLabel} animationType="slide" transparent onRequestClose={onClose}>
        <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <SafeAreaView
              edges={['bottom']}
              style={{ maxHeight: SHEET_MAX_HEIGHT }}
              className="rounded-t-3xl bg-background-light dark:bg-background"
            >
              <View className="flex-row items-center justify-between px-5 pt-4">
                <Text className="font-display text-h3 text-primary-light dark:text-primary">
                  {t('chat.addToRoutineTitle')}
                </Text>
                <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('common.close')} hitSlop={8}>
                  <Feather name="x" size={22} color="#00E5FF" />
                </Pressable>
              </View>
              <Text className="px-5 pt-1 font-body text-small text-secondary-light dark:text-secondary">
                {exercise.name}
              </Text>

              {isLoading || !routine ? (
                <View className="items-center py-10">
                  <ActivityIndicator color="#00E5FF" />
                </View>
              ) : (
                <ScrollView contentContainerClassName="gap-2 px-5 pb-6 pt-3">
                  {routine.days.map((day) => (
                    <Card
                      key={day.id}
                      onPress={() => handlePick(day.id, day.name ?? daysFull[day.day_of_week])}
                      className="flex-row items-center justify-between"
                    >
                      <View className="flex-1 pr-2">
                        <Text className="font-body-semibold text-body text-primary-light dark:text-primary">
                          {daysFull[day.day_of_week]}
                          {day.day_of_week === todayDow ? ` · ${t('chat.today')}` : ''}
                        </Text>
                        {!!day.name && (
                          <Text className="font-body text-small text-secondary-light dark:text-secondary" numberOfLines={1}>
                            {day.name}
                          </Text>
                        )}
                      </View>
                      {addingDayId === day.id ? (
                        <ActivityIndicator color="#00E5FF" size="small" />
                      ) : (
                        <Feather name="chevron-right" size={20} color="#00E5FF" />
                      )}
                    </Card>
                  ))}
                </ScrollView>
              )}
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>

      <InfoModal
        visible={!!addedDayLabel}
        title={t('chat.addedTitle')}
        message={t('chat.addedMessage', { day: addedDayLabel ?? '' })}
        onClose={onClose}
      />
    </>
  );
}
