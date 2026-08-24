import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { useExerciseCatalog } from '@/hooks/useExerciseCatalog';
import type { Exercise } from '@/types/workout';

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

// Tucked behind LiveReviewSetup's dropdown trigger instead of being the
// entire screen — a full-screen list of 18 exercises isn't a friendly
// default landing view.
export function ExercisePickerModal({ visible, onClose, onSelect }: ExercisePickerModalProps) {
  const { exercises, isLoading, error } = useExerciseCatalog();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="font-display text-h2 text-primary-light dark:text-primary">Choose an exercise</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
            <Feather name="x" size={24} color="#00E5FF" />
          </Pressable>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#00E5FF" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center gap-2 px-6">
            <Text className="text-center font-body text-body text-error">Couldn&apos;t load exercises</Text>
            <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">
              {error}
            </Text>
          </View>
        ) : (
          <View className="flex-1 px-4">
            <FlashList
              data={exercises}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View className="h-3" />}
              renderItem={({ item }) => (
                <Card onPress={() => onSelect(item)} className="flex-row items-center justify-between">
                  <Text className="font-body-semibold text-body text-primary-light dark:text-primary">
                    {item.name}
                  </Text>
                  <Feather name="chevron-right" size={20} color="#00E5FF" />
                </Card>
              )}
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
