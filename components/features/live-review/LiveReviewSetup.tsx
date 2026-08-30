import { Feather } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ExercisePickerModal } from '@/components/features/ExercisePickerModal';
import { RestSlider } from '@/components/features/live-review/RestSlider';
import { NumberStepperField } from '@/components/ui/NumberStepperField';
import { InfoModal } from '@/components/ui/InfoModal';
import { useExerciseCatalog } from '@/hooks/useExerciseCatalog';
import type { SessionConfig } from '@/hooks/usePoseSession';
import type { Exercise } from '@/types/workout';

export interface LiveReviewPrefill {
  exerciseId: string;
  routineExerciseId: string;
  reps: number | null;
  sets: number | null;
  restSeconds: number | null;
}

interface LiveReviewSetupProps {
  onStart: (config: SessionConfig) => void;
  prefill?: LiveReviewPrefill | null;
}

// DESIGN_SPEC.md §D flow: "Select Exercise → Position device." This is that
// step, expanded per the user's request into a full pre-workout config —
// exercise, reps, sets, rest — using taps only, no free typing, framed in a
// single centered card matching the rest of the app's surface style.
export function LiveReviewSetup({ onStart, prefill }: LiveReviewSetupProps) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [targetReps, setTargetReps] = useState(10);
  const [totalSets, setTotalSets] = useState(3);
  const [restSeconds, setRestSeconds] = useState(60);
  const [infoOpen, setInfoOpen] = useState(false);
  const { exercises, isLoading: isCatalogLoading, error: catalogError } = useExerciseCatalog();
  // The tab bar floats (position: 'absolute' in app/(app)/_layout.tsx) now
  // instead of reserving its own space.
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  // Applies once the catalog loads and a matching exercise is found —
  // deep-linked from Today's Workout's camera button (only fires for
  // pose-trackable exercises, so a match is expected here).
  useEffect(() => {
    if (!prefill) return;
    const match = exercises.find((e) => e.id === prefill.exerciseId);
    if (!match) return;
    setExercise(match);
    if (prefill.reps != null) setTargetReps(prefill.reps);
    if (prefill.sets != null) setTotalSets(prefill.sets);
    if (prefill.restSeconds != null) setRestSeconds(prefill.restSeconds);
  }, [prefill, exercises]);

  return (
    // 'bottom' excluded: the inline paddingBottom below already shrinks the
    // visible viewport to clear the floating tab bar (position: 'absolute'
    // in app/(app)/_layout.tsx, which itself already accounts for the
    // bottom safe-area inset) — done on the SafeAreaView itself rather than
    // the ScrollView's content, so justify-center below still centers the
    // card within the space actually visible above the pill instead of
    // within a taller, partly-hidden scroll area.
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background"
      edges={['top']}
      style={{ paddingBottom: tabBarHeight + insets.bottom + 12 }}
    >
      <ScrollView
        contentContainerClassName="flex-grow items-center justify-center px-4 py-6"
        keyboardShouldPersistTaps="handled"
      >
        <Card className="w-full max-w-md gap-6">
          <View className="flex-row items-center justify-between">
            <View className="h-11 w-11" />
            <Text className="flex-1 text-center font-display text-h2 text-primary-light dark:text-primary">
              Live Review
            </Text>
            <Pressable
              onPress={() => setInfoOpen(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Live Review info"
              className="h-11 w-11 items-center justify-center rounded-full border border-border-light active:opacity-70 dark:border-border"
            >
              <Feather name="info" size={18} color="#A0A0A8" />
            </Pressable>
          </View>

          <View className="gap-2">
            <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">Exercise</Text>
            <Card onPress={() => setPickerOpen(true)} className="flex-row items-center justify-between">
              <Text className="font-body-semibold text-body text-primary-light dark:text-primary">
                {exercise?.name ?? 'Choose an exercise'}
              </Text>
              <Feather name="chevron-down" size={20} color="#00E5FF" />
            </Card>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <NumberStepperField label="Reps" value={targetReps} onChange={setTargetReps} />
            </View>
            <View className="flex-1">
              <NumberStepperField label="Sets" value={totalSets} onChange={setTotalSets} />
            </View>
          </View>

          <RestSlider value={restSeconds} onChange={setRestSeconds} />

          <Button
            label="Start Workout"
            disabled={!exercise}
            onPress={() =>
              exercise &&
              onStart({
                exercise,
                targetReps,
                totalSets,
                restSeconds,
                routineExerciseId: prefill?.exerciseId === exercise.id ? prefill.routineExerciseId : undefined,
              })
            }
          />
        </Card>
      </ScrollView>

      <ExercisePickerModal
        visible={pickerOpen}
        exercises={exercises}
        isLoading={isCatalogLoading}
        error={catalogError}
        onClose={() => setPickerOpen(false)}
        onSelect={(selected) => {
          setExercise(selected);
          setPickerOpen(false);
        }}
      />

      <InfoModal
        visible={infoOpen}
        title="About Live Review"
        message="Pick an exercise, set your reps, sets, and rest, then start. Your camera tracks your form in real time and your AI trainer coaches you through every rep."
        onClose={() => setInfoOpen(false)}
      />
    </SafeAreaView>
  );
}
