import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AchievementSection } from '@/components/features/AchievementSection';
import { DashboardHeader } from '@/components/features/DashboardHeader';
import { QuickAccessGrid } from '@/components/features/QuickAccessGrid';
import { StatsSummaryCard } from '@/components/features/StatsSummaryCard';
import { NoRoutineState } from '@/components/features/routine/NoRoutineState';
import { TodaysRoutineSection } from '@/components/features/routine/TodaysRoutineSection';
import { UpcomingRoutineList } from '@/components/features/routine/UpcomingRoutineList';
import { useDashboard } from '@/hooks/useDashboard';
import { useRoutine } from '@/hooks/useRoutine';
import { useTodayCompletions } from '@/hooks/useTodayCompletions';
import { calculateLoadKg } from '@/lib/routineLoad';
import { getTodayRoutineDay, getUpcomingRoutineDays } from '@/lib/routineSchedule';

export default function DashboardScreen() {
  const router = useRouter();
  const { greeting, quote, profile, stats, isRefreshing, onRefresh, error } = useDashboard();
  const { routine, isLoading: isRoutineLoading, reload: reloadRoutine } = useRoutine();
  const { completedIds, toggle: toggleExerciseComplete, complete: completeExercise } = useTodayCompletions();

  // Dashboard is a Tabs screen — it stays mounted, so returning from the
  // routine builder (a separate pushed route) needs an explicit refetch to
  // pick up edits instead of relying on remount.
  useFocusEffect(
    useCallback(() => {
      reloadRoutine();
    }, [reloadRoutine])
  );

  const handleRefresh = useCallback(async () => {
    await Promise.all([onRefresh(), reloadRoutine()]);
  }, [onRefresh, reloadRoutine]);

  const todaysDay = routine ? getTodayRoutineDay(routine) : null;
  const todaysLoadKg = todaysDay ? calculateLoadKg(todaysDay.exercises.filter((e) => completedIds.has(e.id))) : 0;

  return (
    // 'bottom' dropped from edges: the Tabs bar below this screen already
    // covers the bottom safe-area inset — adding it here double-pads.
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background" edges={['top']}>
      <DashboardHeader greeting={greeting} avatarUrl={profile?.avatar_url ?? null} />

      <ScrollView
        contentContainerClassName="gap-section pb-12"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#00E5FF" />}
      >
        <View className="gap-section px-6">
          {error && <Text className="font-body text-small text-error">{error}</Text>}

          <StatsSummaryCard
            stats={stats}
            todaysLoadKg={todaysLoadKg}
            goalWorkoutsPerWeek={profile?.workout_frequency_days ?? 3}
          />

          {!isRoutineLoading && !routine && <NoRoutineState />}

          {routine && (
            <>
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-display text-h2 text-primary-light dark:text-primary">Today&apos;s Workout</Text>
                  <Pressable
                    onPress={() => router.push('/routine-builder')}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Edit today's workout"
                    className="h-9 w-9 items-center justify-center rounded-full border border-border-light active:opacity-70 dark:border-border"
                  >
                    <Feather name="edit-2" size={15} color="#00E5FF" />
                  </Pressable>
                </View>
                <TodaysRoutineSection
                  routineId={routine.id}
                  day={todaysDay}
                  completedIds={completedIds}
                  onToggleComplete={toggleExerciseComplete}
                  onCompleteExercise={completeExercise}
                  onDayFinished={handleRefresh}
                />
              </View>

              <View className="gap-3">
                <Text className="font-display text-h2 text-primary-light dark:text-primary">Upcoming</Text>
                <UpcomingRoutineList days={getUpcomingRoutineDays(routine)} />
              </View>
            </>
          )}

          <View className="gap-3">
            <Text className="font-display text-h2 text-primary-light dark:text-primary">Quick Access</Text>
            <QuickAccessGrid />
          </View>

          <AchievementSection stats={stats} goalDays={profile?.workout_frequency_days ?? 3} quote={quote} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
