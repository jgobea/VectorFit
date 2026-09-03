import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { DashboardStats } from '@/types/dashboard';

interface StatsSummaryCardProps {
  stats: DashboardStats | null;
  todaysLoadKg: number;
  goalWorkoutsPerWeek: number;
}

interface StatCellProps {
  icon: keyof typeof Feather.glyphMap;
  value: string;
  label: string;
  labelSuffix?: string;
}

function StatCell({ icon, value, label, labelSuffix }: StatCellProps) {
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
        {labelSuffix ? <Text className="text-secondary-light/60 dark:text-secondary/60"> ({labelSuffix})</Text> : null}
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
export function StatsSummaryCard({ stats, todaysLoadKg, goalWorkoutsPerWeek }: StatsSummaryCardProps) {
  const { t } = useTranslation();
  const workouts = `${stats?.workoutsThisWeek ?? 0}/${goalWorkoutsPerWeek}`;
  const load = `${Math.round(todaysLoadKg)}`;
  const streak = `${stats?.streakDays ?? 0}d`;
  const activeMinutes = `${stats?.todaysActiveMinutes ?? 0}m`;

  return (
    <Card>
      <View className="flex-row">
        <StatCell icon="check-circle" value={workouts} label={t('dashboard.stats.workoutsThisWeek')} />
        <Divider />
        <StatCell icon="bar-chart-2" value={`${load}kg`} label={t('dashboard.stats.todaysLoad')} />
      </View>
      <View className="my-3 h-px bg-border-light dark:bg-border" />
      <View className="flex-row">
        <StatCell icon="repeat" value={streak} label={t('dashboard.stats.dayStreak')} />
        <Divider />
        <StatCell
          icon="clock"
          value={activeMinutes}
          label={t('dashboard.stats.todaysActiveTime')}
          labelSuffix={t('dashboard.stats.includingLiveReview')}
        />
      </View>
    </Card>
  );
}
