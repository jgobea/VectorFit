import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ConfettiBurst } from '@/components/ui/ConfettiBurst';
import { Button } from '@/components/ui/Button';
import { ExerciseTimerModal } from '@/components/features/routine/ExerciseTimerModal';
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
  onCompleteExercise: (exerciseId: string) => void;
  onDayFinished: () => void;
}

function Separator() {
  return <View className="h-px bg-border-light dark:bg-border" />;
}

// "Today's Workout" (the section title above the card) says what this is;
// this says what today's specific day is called (e.g. "Chest Day") — only
// shown when the day actually has a name, since it's optional.
function DayNameHeader({ name }: { name: string | null }) {
  if (!name) return null;
  return (
    <View className="w-full gap-3 pb-1">
      <Text className="font-body-medium text-small text-secondary-light dark:text-secondary">{name}</Text>
      <Separator />
    </View>
  );
}

// Replaces the old scheduled_date TodaysWorkoutSection — sourced from the
// active routine's day matching today's weekday instead. No single "Start
// Workout" button any more — each exercise starts (or gets checked off) on
// its own, and a Finish Day button below the list wraps the whole day up
// once every exercise is checked.
export function TodaysRoutineSection({
  routineId,
  day,
  completedIds,
  onToggleComplete,
  onCompleteExercise,
  onDayFinished,
}: TodaysRoutineSectionProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { isComplete: isDayComplete, isLoading: isDayCompletionLoading, complete } = useTodayDayCompletion();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timingExercise, setTimingExercise] = useState<RoutineExercise | null>(null);

  if (!day || day.is_rest_day) {
    return (
      <Card className="items-center gap-2 py-8">
        <DayNameHeader name={day?.name ?? null} />
        <Feather name="moon" size={22} color="#A0A0A8" />
        <Text className="font-display text-h3 text-primary-light dark:text-primary">{t('dashboard.today.restDayTitle')}</Text>
        <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">
          {t('dashboard.today.restDayMessage')}
        </Text>
      </Card>
    );
  }

  if (day.exercises.length === 0) {
    return (
      <Card className="items-center gap-2 py-8">
        <DayNameHeader name={day.name} />
        <Feather name="edit-3" size={22} color="#A0A0A8" />
        <Text className="font-display text-h3 text-primary-light dark:text-primary">{t('dashboard.today.emptyDayTitle')}</Text>
        <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">
          {t('dashboard.today.emptyDayMessage')}
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
      <DayNameHeader name={day.name} />
      <View style={{ minHeight: day.exercises.length * 52 }}>
        <FlashList
          data={day.exercises}
          renderItem={({ item }) => (
            <RoutineExercisePreviewRow
              item={item}
              isCompleted={completedIds.has(item.id)}
              onToggleComplete={() => onToggleComplete(item.id)}
              onStartLiveReview={() => startLiveReview(item)}
              onStartTimer={() => setTimingExercise(item)}
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
            <Text className="font-body-semibold text-body text-green-neon">{t('dashboard.today.dayComplete')}</Text>
          </View>
        ) : (
          <Button
            label={t('dashboard.today.finishDay')}
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

      <ExerciseTimerModal
        visible={!!timingExercise}
        exercise={timingExercise}
        onClose={() => setTimingExercise(null)}
        onComplete={() => timingExercise && onCompleteExercise(timingExercise.id)}
      />

      <ConfettiBurst play={showConfetti} />
    </Card>
  );
}
