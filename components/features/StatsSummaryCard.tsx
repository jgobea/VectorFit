import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { DashboardStats } from '@/types/dashboard';

interface StatsSummaryCardProps {
  stats: DashboardStats | null;
}

interface StatCellProps {
  icon: keyof typeof Feather.glyphMap;
  value: string;
  label: string;
}

function StatCell({ icon, value, label }: StatCellProps) {
  return (
    <View className="flex-1 items-center gap-1.5 px-2">
      <Feather name={icon} size={17} color="#00E5FF" />
      <Text className="font-display text-h3 text-primary-light dark:text-primary" numberOfLines={1}>
        {value}
      </Text>
      <Text
        className="text-center font-body text-small text-secondary-light dark:text-secondary"
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  return <View className="w-px self-stretch bg-border-light dark:bg-border" />;
}

// One card holding all 4 metrics in a fixed 2x2 grid — replaces the earlier
// horizontal-scroll row of separate cards. Everything is visible at a
// glance, no drag/swipe required, and there's nothing to resize/re-wrap
// across breakpoints.
export function StatsSummaryCard({ stats }: StatsSummaryCardProps) {
  const workouts = String(stats?.workoutsThisWeek ?? 0);
  const calories = `${stats?.caloriesBurned ?? 0}`;
  const streak = `${stats?.streakDays ?? 0}d`;
  const best = stats?.personalBestFormScore != null ? String(Math.round(stats.personalBestFormScore)) : '—';

  return (
    <Card>
      <View className="flex-row">
        <StatCell icon="check-circle" value={workouts} label="Workouts this week" />
        <Divider />
        <StatCell icon="zap" value={calories} label="Calories burned" />
      </View>
      <View className="my-3 h-px bg-border-light dark:bg-border" />
      <View className="flex-row">
        <StatCell icon="repeat" value={streak} label="Day streak" />
        <Divider />
        <StatCell icon="trending-up" value={best} label="Best form score" />
      </View>
    </Card>
  );
}
