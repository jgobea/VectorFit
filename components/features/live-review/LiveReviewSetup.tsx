import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ExercisePickerModal } from '@/components/features/live-review/ExercisePickerModal';
import { RestSlider } from '@/components/features/live-review/RestSlider';
import { NumberStepperField } from '@/components/ui/NumberStepperField';
import { InfoModal } from '@/components/ui/InfoModal';
import type { SessionConfig } from '@/hooks/usePoseSession';
import type { Exercise } from '@/types/workout';

interface LiveReviewSetupProps {
  onStart: (config: SessionConfig) => void;
}

// DESIGN_SPEC.md §D flow: "Select Exercise → Position device." This is that
// step, expanded per the user's request into a full pre-workout config —
// exercise, reps, sets, rest — using taps only, no free typing, framed in a
// single centered card matching the rest of the app's surface style.
export function LiveReviewSetup({ onStart }: LiveReviewSetupProps) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [targetReps, setTargetReps] = useState(10);
  const [totalSets, setTotalSets] = useState(3);
  const [restSeconds, setRestSeconds] = useState(60);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    // 'bottom' excluded: the Tabs bar below this screen already covers the
    // bottom safe-area inset (visible here — it only hides once a session
    // actually starts, see app/(app)/live-review.tsx).
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background" edges={['top']}>
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
            onPress={() => exercise && onStart({ exercise, targetReps, totalSets, restSeconds })}
          />
        </Card>
      </ScrollView>

      <ExercisePickerModal
        visible={pickerOpen}
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
