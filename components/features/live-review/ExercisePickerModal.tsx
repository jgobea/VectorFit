import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { useExerciseCatalog } from '@/hooks/useExerciseCatalog';
import type { Exercise } from '@/types/workout';

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

const UNCATEGORIZED = 'Other';

// A NativeWind max-h-[70%] on a View nested inside two Pressables didn't
// reliably resolve on Android — RN's percentage-height resolution against
// non-trivial ancestor chains is flaky. Computing the cap in pixels from
// the window is unambiguous.
const SHEET_MAX_HEIGHT = Dimensions.get('window').height * 0.7;

function groupByCategory(exercises: Exercise[]): [string, Exercise[]][] {
  const groups = new Map<string, Exercise[]>();
  for (const exercise of exercises) {
    const key = exercise.category ?? UNCATEGORIZED;
    const group = groups.get(key);
    if (group) group.push(exercise);
    else groups.set(key, [exercise]);
  }
  return Array.from(groups.entries());
}

// A dropdown, not a full-page list — presented as a bottom sheet over a
// dimmed backdrop, grouped by body area, so picking an exercise from 18
// options doesn't feel like navigating to a whole new screen.
export function ExercisePickerModal({ visible, onClose, onSelect }: ExercisePickerModalProps) {
  const { exercises, isLoading, error } = useExerciseCatalog();
  const groups = groupByCategory(exercises);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <SafeAreaView
            edges={['bottom']}
            style={{ maxHeight: SHEET_MAX_HEIGHT }}
            className="rounded-t-3xl bg-background-light dark:bg-background"
          >
            <View className="flex-row items-center justify-between px-5 pt-4">
              <Text className="font-display text-h3 text-primary-light dark:text-primary">Choose an exercise</Text>
              <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
                <Feather name="x" size={22} color="#00E5FF" />
              </Pressable>
            </View>

            {isLoading ? (
              <View className="items-center py-10">
                <ActivityIndicator color="#00E5FF" />
              </View>
            ) : error ? (
              <View className="items-center gap-2 px-6 py-10">
                <Text className="text-center font-body text-body text-error">Couldn&apos;t load exercises</Text>
                <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">
                  {error}
                </Text>
              </View>
            ) : (
              <ScrollView className="px-5" contentContainerClassName="gap-4 pb-6 pt-3">
                {groups.map(([category, items]) => (
                  <View key={category} className="gap-2">
                    <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">
                      {category.toUpperCase()}
                    </Text>
                    <View className="gap-2">
                      {items.map((item) => (
                        <Card key={item.id} onPress={() => onSelect(item)} className="flex-row items-center justify-between">
                          <Text className="font-body-semibold text-body text-primary-light dark:text-primary">
                            {item.name}
                          </Text>
                          <Feather name="chevron-right" size={20} color="#00E5FF" />
                        </Card>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
