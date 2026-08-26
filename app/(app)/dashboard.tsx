import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AchievementSection } from '@/components/features/AchievementSection';
import { DashboardHeader } from '@/components/features/DashboardHeader';
import { QuickAccessGrid } from '@/components/features/QuickAccessGrid';
import { StatsSummaryCard } from '@/components/features/StatsSummaryCard';
import { TodaysWorkoutSection } from '@/components/features/TodaysWorkoutSection';
import { UpcomingWorkoutsList } from '@/components/features/UpcomingWorkoutsList';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardScreen() {
  const { greeting, quote, profile, todaysWorkouts, upcomingWorkouts, stats, isRefreshing, onRefresh, error } =
    useDashboard();

  return (
    // 'bottom' dropped from edges: the Tabs bar below this screen already
    // covers the bottom safe-area inset — adding it here double-pads.
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background" edges={['top']}>
      <DashboardHeader greeting={greeting} />

      <ScrollView
        contentContainerClassName="gap-section pb-12"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#00E5FF" />}
      >
        <View className="gap-section px-6">
          {error && <Text className="font-body text-small text-error">{error}</Text>}

          <StatsSummaryCard stats={stats} />

          <View className="gap-3">
            <Text className="font-display text-h2 text-primary-light dark:text-primary">Today&apos;s Workout</Text>
            <TodaysWorkoutSection workout={todaysWorkouts[0] ?? null} />
          </View>

          <View className="gap-3">
            <Text className="font-display text-h2 text-primary-light dark:text-primary">Upcoming</Text>
            <UpcomingWorkoutsList workouts={upcomingWorkouts} />
          </View>

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
