import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ProfileSection } from '@/components/features/profile/ProfileSection';
import type { ProfileStats } from '@/types/profileStats';

interface WorkoutHistorySectionProps {
  stats: ProfileStats | null;
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text className="font-display text-h2 text-primary-light dark:text-primary">{value}</Text>
      <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">{label}</Text>
    </View>
  );
}

// DESIGN_SPEC.md §E.6: totals + an expandable personal-records list. Records
// are derived live from pose_sessions.best_rep_score (see
// hooks/useProfileStats.ts) rather than a fake feed — same pattern
// AchievementSection established on the Dashboard.
export function WorkoutHistorySection({ stats }: WorkoutHistorySectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <ProfileSection title="Workout History">
      <View className="flex-row">
        <StatCell value={String(stats?.totalWorkouts ?? 0)} label="Workouts completed" />
        <StatCell value={`${stats?.totalHours ?? 0}h`} label="Hours trained" />
        <StatCell value={`${stats?.longestStreakDays ?? 0}d`} label="Longest streak" />
      </View>

      <Pressable
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel="Toggle personal records"
        className="flex-row items-center justify-between border-t border-border-light pt-3 active:opacity-70 dark:border-border"
      >
        <Text className="font-body-semibold text-body text-primary-light dark:text-primary">Personal Records</Text>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#00E5FF" />
      </Pressable>

      {expanded && (
        <View className="gap-2">
          {stats?.personalRecords.length ? (
            stats.personalRecords.map((record) => (
              <View key={record.exerciseId} className="flex-row items-center justify-between">
                <Text className="font-body text-body text-secondary-light dark:text-secondary">{record.exerciseName}</Text>
                <Text className="font-body-semibold text-body text-green-neon">{Math.round(record.bestRepScore)}</Text>
              </View>
            ))
          ) : (
            <Text className="font-body text-small text-secondary-light dark:text-secondary">
              No Live Review sessions recorded yet.
            </Text>
          )}
        </View>
      )}
    </ProfileSection>
  );
}
