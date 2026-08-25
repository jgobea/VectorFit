import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ExercisePickerModal } from '@/components/features/live-review/ExercisePickerModal';
import { NumberStepperField } from '@/components/features/live-review/NumberStepperField';
import { RestSlider } from '@/components/features/live-review/RestSlider';
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

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background">
      <ScrollView
        contentContainerClassName="flex-grow items-center justify-center px-4 py-6"
        keyboardShouldPersistTaps="handled"
      >
        <Card className="w-full max-w-md gap-6">
          <Text className="text-center font-display text-h2 text-primary-light dark:text-primary">Live Review</Text>

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
    </SafeAreaView>
  );
}
