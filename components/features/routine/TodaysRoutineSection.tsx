import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ConfettiBurst } from '@/components/ui/ConfettiBurst';
import { Button } from '@/components/ui/Button';
import { FinishDayModal } from '@/components/features/routine/FinishDayModal';
import { RoutineExercisePreviewRow } from '@/components/features/routine/RoutineExercisePreviewRow';
import { useTodayDayCompletion } from '@/hooks/useTodayDayCompletion';
import { calculateLoadKg } from '@/lib/routineLoad';
import type { RoutineDay, RoutineExercise } from '@/types/routine';

interface TodaysRoutineSectionProps {
  routineId: string;
  day: RoutineDay | null;
  completedIds: Set<string>;
  onToggleComplete: (exerciseId: string) => void;
  onDayFinished: () => void;
}

function Separator() {
  return <View className="h-px bg-border-light dark:bg-border" />;
}

// Replaces the old scheduled_date TodaysWorkoutSection — sourced from the
// active routine's day matching today's weekday instead. No single "Start
// Workout" button any more — each exercise starts (or gets checked off) on
// its own, and a Finish Day button below the list wraps the whole day up
// once every exercise is checked.
export function TodaysRoutineSection({ routineId, day, completedIds, onToggleComplete, onDayFinished }: TodaysRoutineSectionProps) {
  const router = useRouter();
  const { isComplete: isDayComplete, isLoading: isDayCompletionLoading, complete } = useTodayDayCompletion();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  if (!day || day.is_rest_day) {
    return (
      <Card className="items-center gap-2 py-8">
        <Feather name="moon" size={22} color="#A0A0A8" />
        <Text className="font-display text-h3 text-primary-light dark:text-primary">Rest day</Text>
        <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">
          {day?.notes || 'Nothing scheduled for today — recover and come back stronger.'}
        </Text>
      </Card>
    );
  }

  if (day.exercises.length === 0) {
    return (
      <Card className="items-center gap-2 py-8">
        <Feather name="edit-3" size={22} color="#A0A0A8" />
        <Text className="font-display text-h3 text-primary-light dark:text-primary">Training day, no exercises yet</Text>
        <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">
          Add exercises to today in your routine to see them here.
        </Text>
      </Card>
    );
  }

  const startLiveReview = (item: RoutineExercise) => {
    router.push({
      pathname: '/(app)/live-review',
      params: {
        exerciseId: item.exercise_id,
        routineExerciseId: item.id,
        ...(item.reps != null && { reps: String(item.reps) }),
        ...(item.sets != null && { sets: String(item.sets) }),
        ...(item.rest_seconds != null && { restSeconds: String(item.rest_seconds) }),
      },
    });
  };

  const allDone = day.exercises.every((e) => completedIds.has(e.id));

  const handleConfirm = async () => {
    setIsFinishing(true);
    const ok = await complete({ routineId, exerciseCount: day.exercises.length, totalLoadKg: calculateLoadKg(day.exercises) });
    setIsFinishing(false);
    if (!ok) return;
    setConfirmOpen(false);
    setShowConfetti(true);
    onDayFinished();
    setTimeout(() => setShowConfetti(false), 1400);
  };

  return (
    <Card style={{ position: 'relative' }}>
      <View style={{ minHeight: day.exercises.length * 52 }}>
        <FlashList
          data={day.exercises}
          renderItem={({ item }) => (
            <RoutineExercisePreviewRow
              item={item}
              isCompleted={completedIds.has(item.id)}
              onToggleComplete={() => onToggleComplete(item.id)}
              onStartLiveReview={() => startLiveReview(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={Separator}
          scrollEnabled={false}
        />
      </View>

      <View className="mt-4">
        {isDayComplete ? (
          <View className="h-14 flex-row items-center justify-center gap-2 rounded-xl bg-green-neon/15">
            <Feather name="check-circle" size={18} color="#39FF14" />
            <Text className="font-body-semibold text-body text-green-neon">Day Complete!</Text>
          </View>
        ) : (
          <Button
            label="Finish Day"
            disabled={!allDone || isDayCompletionLoading}
            onPress={() => setConfirmOpen(true)}
          />
        )}
      </View>

      <FinishDayModal
        visible={confirmOpen}
        exercises={day.exercises}
        isSubmitting={isFinishing}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />

      <ConfettiBurst play={showConfetti} />
    </Card>
  );
}
