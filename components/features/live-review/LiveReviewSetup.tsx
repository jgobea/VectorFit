import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ExercisePickerModal } from '@/components/features/live-review/ExercisePickerModal';
import { OptionButtonRow } from '@/components/features/live-review/OptionButtonRow';
import type { SessionConfig } from '@/hooks/usePoseSession';
import type { Exercise } from '@/types/workout';

const REP_OPTIONS = [6, 8, 10, 12, 15, 20];
const SET_OPTIONS = [1, 2, 3, 4, 5];
const REST_OPTIONS = [15, 30, 45, 60, 90, 120];

interface LiveReviewSetupProps {
  onStart: (config: SessionConfig) => void;
}

// DESIGN_SPEC.md §D flow: "Select Exercise → Position device." This is that
// step, expanded per the user's request into a full pre-workout config —
// exercise, reps, sets, rest — using taps only, no typing.
export function LiveReviewSetup({ onStart }: LiveReviewSetupProps) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [targetReps, setTargetReps] = useState(10);
  const [totalSets, setTotalSets] = useState(3);
  const [restSeconds, setRestSeconds] = useState(60);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background">
      <ScrollView contentContainerClassName="gap-6 px-4 pb-6 pt-4" keyboardShouldPersistTaps="handled">
        <Text className="font-display text-h2 text-primary-light dark:text-primary">Live Review</Text>

        <View className="gap-2">
          <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">Exercise</Text>
          <Card onPress={() => setPickerOpen(true)} className="flex-row items-center justify-between">
            <Text className="font-body-semibold text-body text-primary-light dark:text-primary">
              {exercise?.name ?? 'Choose an exercise'}
            </Text>
            <Feather name="chevron-down" size={20} color="#00E5FF" />
          </Card>
        </View>

        <OptionButtonRow label="Reps per set" options={REP_OPTIONS} value={targetReps} onChange={setTargetReps} />
        <OptionButtonRow label="Sets" options={SET_OPTIONS} value={totalSets} onChange={setTotalSets} />
        <OptionButtonRow
          label="Rest between sets"
          options={REST_OPTIONS}
          value={restSeconds}
          onChange={setRestSeconds}
          formatOption={(s) => (s < 60 ? `${s}s` : `${s / 60}m`)}
        />

        <Button
          label="Start Workout"
          disabled={!exercise}
          onPress={() => exercise && onStart({ exercise, targetReps, totalSets, restSeconds })}
        />
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
