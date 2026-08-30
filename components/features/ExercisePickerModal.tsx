import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExercisePickerRow } from '@/components/features/ExercisePickerRow';
import { Button } from '@/components/ui/Button';
import type { Exercise } from '@/types/workout';

interface ExercisePickerModalProps {
  visible: boolean;
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  /** Current user's id, to tell their own custom exercises apart from shared/seeded ones. */
  currentUserId?: string;
  /** Omit to disable "add your own exercise" — e.g. Live Review's picker, where a custom exercise with no quickpose_feature couldn't be used anyway. */
  onCreateCustom?: (name: string, measurementType: 'reps' | 'time', timeMode: 'countdown' | 'stopwatch' | null) => void;
  onDeleteCustom?: (exerciseId: string) => void;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

const UNCATEGORIZED = 'Other';

// A NativeWind max-h-[70%] on a View nested inside two Pressables didn't
// reliably resolve on Android — RN's percentage-height resolution against
// non-trivial ancestor chains is flaky. Computing the cap in pixels from
// the window is unambiguous.
const SHEET_MAX_HEIGHT = Dimensions.get('window').height * 0.7;

// Live Review-compatible exercises float to the top of each category group
// — a lightweight separation from custom/other exercises without a whole
// second sectioning scheme.
function groupByCategory(exercises: Exercise[]): [string, Exercise[]][] {
  const groups = new Map<string, Exercise[]>();
  for (const exercise of exercises) {
    const key = exercise.category ?? UNCATEGORIZED;
    const group = groups.get(key);
    if (group) group.push(exercise);
    else groups.set(key, [exercise]);
  }
  for (const items of groups.values()) {
    items.sort((a, b) => Number(!!b.quickpose_feature) - Number(!!a.quickpose_feature));
  }
  return Array.from(groups.entries());
}

// A dropdown, not a full-page list — presented as a bottom sheet over a
// dimmed backdrop, grouped by body area, so picking an exercise from the
// catalog doesn't feel like navigating to a whole new screen. Takes its
// exercise list as a prop rather than fetching internally — Live Review
// (useExerciseCatalog, pose-trackable only) and the routine builder
// (useAllExercises, everything including the user's own) need different
// subsets of the same catalog.
export function ExercisePickerModal({
  visible,
  exercises,
  isLoading,
  error,
  currentUserId,
  onCreateCustom,
  onDeleteCustom,
  onClose,
  onSelect,
}: ExercisePickerModalProps) {
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftMeasurementType, setDraftMeasurementType] = useState<'reps' | 'time'>('reps');
  const [draftTimeMode, setDraftTimeMode] = useState<'countdown' | 'stopwatch'>('stopwatch');
  const groups = groupByCategory(exercises);

  const submitCustom = () => {
    const name = draftName.trim();
    if (!name || !onCreateCustom) return;
    onCreateCustom(name, draftMeasurementType, draftMeasurementType === 'time' ? draftTimeMode : null);
    setDraftName('');
    setDraftMeasurementType('reps');
    setDraftTimeMode('stopwatch');
    setCreating(false);
  };

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

            {onCreateCustom &&
              (creating ? (
                <View className="gap-2 px-5 pt-3">
                  <TextInput
                    value={draftName}
                    onChangeText={setDraftName}
                    placeholder="Exercise name"
                    placeholderTextColor="#A0A0A8"
                    autoFocus
                    onSubmitEditing={submitCustom}
                    className="h-12 rounded-xl border border-border-light px-4 font-body text-body text-primary-light dark:border-border dark:text-primary"
                  />

                  <View className="flex-row rounded-xl border border-border-light p-1 dark:border-border">
                    <Pressable
                      onPress={() => setDraftMeasurementType('reps')}
                      accessibilityRole="button"
                      accessibilityState={{ selected: draftMeasurementType === 'reps' }}
                      className={`h-9 flex-1 items-center justify-center rounded-lg ${draftMeasurementType === 'reps' ? 'bg-cyan-vivid/15' : ''}`}
                    >
                      <Text
                        className={`font-body-semibold text-small ${draftMeasurementType === 'reps' ? 'text-cyan-vivid' : 'text-secondary-light dark:text-secondary'}`}
                      >
                        Weight / Reps
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setDraftMeasurementType('time')}
                      accessibilityRole="button"
                      accessibilityState={{ selected: draftMeasurementType === 'time' }}
                      className={`h-9 flex-1 items-center justify-center rounded-lg ${draftMeasurementType === 'time' ? 'bg-cyan-vivid/15' : ''}`}
                    >
                      <Text
                        className={`font-body-semibold text-small ${draftMeasurementType === 'time' ? 'text-cyan-vivid' : 'text-secondary-light dark:text-secondary'}`}
                      >
                        Time
                      </Text>
                    </Pressable>
                  </View>

                  {draftMeasurementType === 'time' && (
                    <View className="flex-row rounded-xl border border-border-light p-1 dark:border-border">
                      <Pressable
                        onPress={() => setDraftTimeMode('stopwatch')}
                        accessibilityRole="button"
                        accessibilityState={{ selected: draftTimeMode === 'stopwatch' }}
                        className={`h-9 flex-1 items-center justify-center rounded-lg ${draftTimeMode === 'stopwatch' ? 'bg-cyan-vivid/15' : ''}`}
                      >
                        <Text
                          className={`font-body-semibold text-small ${draftTimeMode === 'stopwatch' ? 'text-cyan-vivid' : 'text-secondary-light dark:text-secondary'}`}
                        >
                          Count up
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setDraftTimeMode('countdown')}
                        accessibilityRole="button"
                        accessibilityState={{ selected: draftTimeMode === 'countdown' }}
                        className={`h-9 flex-1 items-center justify-center rounded-lg ${draftTimeMode === 'countdown' ? 'bg-cyan-vivid/15' : ''}`}
                      >
                        <Text
                          className={`font-body-semibold text-small ${draftTimeMode === 'countdown' ? 'text-cyan-vivid' : 'text-secondary-light dark:text-secondary'}`}
                        >
                          Countdown
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Button label="Cancel" variant="secondary" onPress={() => setCreating(false)} />
                    </View>
                    <View className="flex-1">
                      <Button label="Add" disabled={!draftName.trim()} onPress={submitCustom} />
                    </View>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => setCreating(true)}
                  accessibilityRole="button"
                  className="mx-5 mt-3 h-12 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-vivid/50 active:opacity-70"
                >
                  <Feather name="plus" size={16} color="#00E5FF" />
                  <Text className="font-body-semibold text-small text-cyan-vivid">Add your own exercise</Text>
                </Pressable>
              ))}

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
                        <ExercisePickerRow
                          key={item.id}
                          exercise={item}
                          isOwnCustom={!!currentUserId && item.created_by === currentUserId}
                          onSelect={() => onSelect(item)}
                          onDelete={onDeleteCustom ? () => onDeleteCustom(item.id) : undefined}
                        />
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
