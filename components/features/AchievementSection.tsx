import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import type { DashboardStats } from '@/types/dashboard';

interface AchievementSectionProps {
  stats: DashboardStats | null;
  goalDays: number;
  quote: string;
}

interface Badge {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
}

// DESIGN_SPEC.md §B.6: badges + weekly progress + motivational message.
// No badges table exists yet (see HANDOFF.md), so badges are derived live
// from real workout_sessions/pose_sessions stats rather than a fake feed.
export function AchievementSection({ stats, goalDays, quote }: AchievementSectionProps) {
  const done = stats?.workoutsThisWeek ?? 0;
  const progress = Math.min(1, goalDays > 0 ? done / goalDays : 0);

  const badges: Badge[] = [];
  if ((stats?.streakDays ?? 0) >= 3) badges.push({ key: 'streak', icon: 'repeat', label: `${stats!.streakDays}-Day Streak` });
  if (done >= goalDays && goalDays > 0) badges.push({ key: 'goal', icon: 'award', label: 'Weekly Goal Hit' });
  if (stats?.personalBestFormScore != null) badges.push({ key: 'pr', icon: 'trending-up', label: 'New Form PR' });

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-display text-h3 text-primary-light dark:text-primary">This Week</Text>
        <Text className="font-body text-small text-secondary-light dark:text-secondary">
          {done}/{goalDays} workouts
        </Text>
      </View>

      <View className="h-2 overflow-hidden rounded-full bg-border-light dark:bg-border">
        <View className="h-2 rounded-full bg-cyan-vivid" style={{ width: `${progress * 100}%` }} />
      </View>

      {badges.length > 0 && (
        <View className="flex-row flex-wrap gap-2 pt-1">
          {badges.map((b) => (
            <View
              key={b.key}
              className="flex-row items-center gap-1.5 rounded-full border border-green-neon/40 px-3 py-1.5"
            >
              <Feather name={b.icon} size={13} color="#39FF14" />
              <Text className="font-body-medium text-small text-primary-light dark:text-primary">{b.label}</Text>
            </View>
          ))}
        </View>
      )}

      <Text className="pt-1 font-body text-small italic text-secondary-light dark:text-secondary">
        “{quote}”
      </Text>
    </Card>
  );
}
