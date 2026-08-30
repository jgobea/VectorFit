import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { ActivityIndicator, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';

import { ActivityStrip } from '@/components/features/progress/ActivityStrip';
import { ProgressSection } from '@/components/features/progress/ProgressSection';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import { useProgressStats } from '@/hooks/useProgressStats';
import { useAuthStore } from '@/stores/authStore';

const CATEGORY_COLORS: Record<string, string> = {
  'Upper Body': Colors.cyanVivid,
  'Lower Body': Colors.greenNeon,
  Core: Colors.warning,
  'Full Body': Colors.error,
};

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text className="font-display text-h2 text-primary-light dark:text-primary">{value}</Text>
      <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">{label}</Text>
    </View>
  );
}

// Outside both (auth) and (app) route groups — same precedent as
// app/terms.tsx: a read-only screen reached via router.push, no tab bar.
export default function ProgressScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const { stats, isLoading } = useProgressStats(userId);
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme === 'light' ? 'light' : 'dark'];
  const { width } = useWindowDimensions();
  // Screen ScrollView is px-6 (24px/side) and Card is p-card (16px/side) —
  // that's the space available inside a chart's Card. gifted-charts then
  // renders its own y-axis label column *in addition to* the `width` prop
  // (actualContainerWidth = width + yAxisLabelWidth, default 35) — not
  // subtracting it here is what pushed the bar/line charts past the card's
  // right edge.
  const Y_AXIS_LABEL_WIDTH = 35;
  const chartWidth = width - 24 * 2 - 16 * 2 - Y_AXIS_LABEL_WIDTH;

  const otherColor = theme.textSecondary;
  const categoryColor = (category: string) => CATEGORY_COLORS[category] ?? otherColor;

  const hasAnyData =
    !!stats && (stats.totalWorkouts > 0 || stats.weeklyFormScore.length > 0 || stats.categoryBreakdown.length > 0);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background" edges={['top']}>
      <View className="flex-row items-center gap-3 border-b border-border-light px-4 pb-3 pt-2 dark:border-border">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          className="h-11 w-11 items-center justify-center active:opacity-70"
        >
          <Feather name="chevron-left" size={24} color="#00E5FF" />
        </Pressable>
        <Text className="flex-1 font-display text-h3 text-primary-light dark:text-primary">Your Progress</Text>
      </View>

      {isLoading || !stats ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#00E5FF" />
        </View>
      ) : !hasAnyData ? (
        <View className="flex-1 items-center justify-center px-6">
          <Card className="items-center gap-3 py-10">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-cyan-vivid/10">
              <Feather name="bar-chart-2" size={30} color="#00E5FF" />
            </View>
            <Text className="font-display text-h3 text-primary-light dark:text-primary">Nothing to show yet</Text>
            <Text className="max-w-xs text-center font-body text-small text-secondary-light dark:text-secondary">
              Finish a routine day or a Live Review session and your stats and charts will show up here.
            </Text>
          </Card>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-section px-6 pb-16 pt-4" showsVerticalScrollIndicator={false}>
          <Card>
            <View className="flex-row">
              <StatCell value={String(stats.totalWorkouts)} label="Workouts" />
              <StatCell value={`${stats.totalHours}h`} label="Hours trained" />
              <StatCell value={`${stats.currentStreakDays}d`} label="Current streak" />
              <StatCell value={`${stats.longestStreakDays}d`} label="Best streak" />
            </View>
          </Card>

          <ProgressSection title="Last 14 Days" subtitle="Days you completed a routine">
            <ActivityStrip days={stats.last14Days} />
          </ProgressSection>

          <ProgressSection title="Weekly Activity" subtitle="Workouts completed per week">
            <BarChart
              data={stats.weeklyWorkouts.map((w) => ({ value: w.count, label: w.weekLabel, frontColor: Colors.cyanVivid }))}
              width={chartWidth}
              height={140}
              barWidth={14}
              spacing={16}
              initialSpacing={10}
              endSpacing={10}
              disableScroll
              noOfSections={4}
              maxValue={Math.max(4, ...stats.weeklyWorkouts.map((w) => w.count))}
              roundedTop
              yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 9 }}
              yAxisColor={theme.border}
              xAxisColor={theme.border}
              rulesColor={theme.border}
              rulesType="dashed"
            />
          </ProgressSection>

          <ProgressSection title="Form Score Trend" subtitle="Weekly average from Live Review sessions">
            {stats.weeklyFormScore.length > 0 ? (
              <LineChart
                data={stats.weeklyFormScore.map((w) => ({ value: w.avgFormScore, label: w.weekLabel }))}
                width={chartWidth}
                height={140}
                spacing={Math.max(30, (chartWidth - 20) / Math.max(1, stats.weeklyFormScore.length - 1) - 4)}
                initialSpacing={10}
                endSpacing={10}
                disableScroll
                curved
                color={Colors.greenNeon}
                thickness={2}
                dataPointsColor={Colors.greenNeon}
                noOfSections={4}
                maxValue={100}
                yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 9 }}
                yAxisColor={theme.border}
                xAxisColor={theme.border}
                rulesColor={theme.border}
                rulesType="dashed"
              />
            ) : (
              <Text className="py-6 text-center font-body text-small text-secondary-light dark:text-secondary">
                Complete a Live Review session to see this.
              </Text>
            )}
          </ProgressSection>

          <ProgressSection title="Training Focus" subtitle="Live Review sessions by body area">
            {stats.categoryBreakdown.length > 0 ? (
              <View className="flex-row items-center gap-6">
                <PieChart
                  data={stats.categoryBreakdown.map((c) => ({ value: c.sessionCount, color: categoryColor(c.category) }))}
                  donut
                  radius={60}
                  innerRadius={38}
                  centerLabelComponent={() => (
                    <Text className="font-display text-h3 text-primary-light dark:text-primary">
                      {stats.categoryBreakdown.reduce((sum, c) => sum + c.sessionCount, 0)}
                    </Text>
                  )}
                />
                <View className="flex-1 gap-2">
                  {stats.categoryBreakdown.map((c) => {
                    const total = stats.categoryBreakdown.reduce((sum, s) => sum + s.sessionCount, 0);
                    const pct = total > 0 ? Math.round((c.sessionCount / total) * 100) : 0;
                    return (
                      <View key={c.category} className="flex-row items-center gap-2">
                        <View className="h-3 w-3 rounded-full" style={{ backgroundColor: categoryColor(c.category) }} />
                        <Text className="flex-1 font-body text-small text-primary-light dark:text-primary" numberOfLines={1}>
                          {c.category}
                        </Text>
                        <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">
                          {pct}%
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <Text className="py-6 text-center font-body text-small text-secondary-light dark:text-secondary">
                Complete a Live Review session to see this.
              </Text>
            )}
          </ProgressSection>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
