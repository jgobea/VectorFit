import { Feather } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ExerciseDemoContent } from '@/components/features/ExerciseDemoContent';
import { ExercisePickerModal } from '@/components/features/ExercisePickerModal';
import { RestSlider } from '@/components/features/live-review/RestSlider';
import { NumberStepperField } from '@/components/ui/NumberStepperField';
import { InfoModal } from '@/components/ui/InfoModal';
import { hasExerciseDemo, translateExerciseName } from '@/constants/exerciseCatalog';
import { useExerciseCatalog } from '@/hooks/useExerciseCatalog';
import type { SessionConfig } from '@/hooks/usePoseSession';
import type { Exercise } from '@/types/workout';

type TimeMode = 'countdown' | 'stopwatch';
const TIME_MODES: TimeMode[] = ['countdown', 'stopwatch'];

export interface LiveReviewPrefill {
  exerciseId: string;
  routineExerciseId: string;
  reps: number | null;
  /** Target seconds, for a timed exercise (plank). */
  durationSeconds: number | null;
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
  const [timeMode, setTimeMode] = useState<TimeMode>('countdown');
  const [targetSeconds, setTargetSeconds] = useState(30);
  const [infoOpen, setInfoOpen] = useState(false);
  const { exercises, isLoading: isCatalogLoading, error: catalogError } = useExerciseCatalog();
  const { t } = useTranslation();
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
    if (match.measurement_type === 'time') setTimeMode(match.time_mode ?? 'countdown');
    if (prefill.reps != null) setTargetReps(prefill.reps);
    if (prefill.durationSeconds != null) setTargetSeconds(prefill.durationSeconds);
    if (prefill.sets != null) setTotalSets(prefill.sets);
    if (prefill.restSeconds != null) setRestSeconds(prefill.restSeconds);
  }, [prefill, exercises]);

  const isTimed = exercise?.measurement_type === 'time';

  const selectExercise = (selected: Exercise) => {
    setExercise(selected);
    if (selected.measurement_type === 'time') setTimeMode(selected.time_mode ?? 'countdown');
  };

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
              {t('nav.liveReview')}
            </Text>
            <Pressable
              onPress={() => setInfoOpen(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('liveReview.setup.infoLabel')}
              className="h-11 w-11 items-center justify-center rounded-full border border-border-light active:opacity-70 dark:border-border"
            >
              <Feather name="info" size={18} color="#A0A0A8" />
            </Pressable>
          </View>

          <View className="gap-2">
            <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">{t('liveReview.setup.exercise')}</Text>
            <Card onPress={() => setPickerOpen(true)} className="flex-row items-center justify-between">
              <Text className="font-body-semibold text-body text-primary-light dark:text-primary">
                {exercise ? translateExerciseName(t, exercise.name) : t('liveReview.setup.chooseExercise')}
              </Text>
              <Feather name="chevron-down" size={20} color="#00E5FF" />
            </Card>
          </View>

          {isTimed && (
            <View className="gap-2">
              <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">{t('liveReview.setup.timeMode')}</Text>
              <View className="flex-row rounded-xl border border-border-light p-1 dark:border-border">
                {TIME_MODES.map((mode) => (
                  <Pressable
                    key={mode}
                    onPress={() => setTimeMode(mode)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: timeMode === mode }}
                    className={`h-10 flex-1 items-center justify-center rounded-lg ${timeMode === mode ? 'bg-cyan-vivid/15' : ''}`}
                  >
                    <Text
                      className={`font-body-semibold text-small ${timeMode === mode ? 'text-cyan-vivid' : 'text-secondary-light dark:text-secondary'}`}
                    >
                      {t(`liveReview.setup.${mode}`)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View className="flex-row gap-4">
            {!isTimed && (
              <View className="flex-1">
                <NumberStepperField label={t('liveReview.setup.reps')} value={targetReps} onChange={setTargetReps} />
              </View>
            )}
            {isTimed && timeMode === 'countdown' && (
              <View className="flex-1">
                <NumberStepperField
                  label={t('liveReview.setup.seconds')}
                  value={targetSeconds}
                  step={5}
                  min={5}
                  onChange={setTargetSeconds}
                />
              </View>
            )}
            <View className="flex-1">
              <NumberStepperField label={t('liveReview.setup.sets')} value={totalSets} onChange={setTotalSets} />
            </View>
          </View>

          <RestSlider value={restSeconds} onChange={setRestSeconds} />

          <Button
            label={t('liveReview.setup.startWorkout')}
            disabled={!exercise}
            onPress={() =>
              exercise &&
              onStart({
                exercise,
                targetReps: isTimed ? (timeMode === 'countdown' ? targetSeconds : 0) : targetReps,
                timeMode: isTimed ? timeMode : undefined,
                totalSets,
                restSeconds,
                routineExerciseId: prefill?.exerciseId === exercise.id ? prefill.routineExerciseId : undefined,
              })
            }
          />

          {exercise && hasExerciseDemo(exercise) && (
            <View className="gap-3 border-t border-border-light pt-5 dark:border-border">
              <Text className="font-display text-h3 text-primary-light dark:text-primary">{t('exercises.demo.section')}</Text>
              <ExerciseDemoContent exercise={exercise} />
            </View>
          )}
        </Card>
      </ScrollView>

      <ExercisePickerModal
        visible={pickerOpen}
        exercises={exercises}
        isLoading={isCatalogLoading}
        error={catalogError}
        onClose={() => setPickerOpen(false)}
        onSelect={(selected) => {
          selectExercise(selected);
          setPickerOpen(false);
        }}
      />

      <InfoModal
        visible={infoOpen}
        title={t('liveReview.setup.aboutTitle')}
        message={t('liveReview.setup.aboutMessage')}
        onClose={() => setInfoOpen(false)}
      />
    </SafeAreaView>
  );
}
