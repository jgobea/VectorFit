import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { ProfileGroup } from '@/components/features/profile/ProfileGroup';
import { Colors } from '@/constants/theme';
import type { ProfileStats } from '@/types/profileStats';

interface WorkoutHistorySectionProps {
  stats: ProfileStats | null;
}

const ACCENT = Colors.cyanVivid;

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text className="font-display text-h2" style={{ color: ACCENT }}>
        {value}
      </Text>
      <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">{label}</Text>
    </View>
  );
}

// DESIGN_SPEC.md §E.6: totals + an expandable personal-records list. Records
// are derived live from pose_sessions.best_rep_score (see
// hooks/useProfileStats.ts) rather than a fake feed — same pattern
// AchievementSection established on the Dashboard.
export function WorkoutHistorySection({ stats }: WorkoutHistorySectionProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <ProfileGroup title={t('profile.history.title')}>
      <View className="flex-row px-4 py-4">
        <StatCell value={String(stats?.totalWorkouts ?? 0)} label={t('profile.history.workoutsCompleted')} />
        <StatCell value={`${stats?.totalHours ?? 0}h`} label={t('profile.history.hoursTrained')} />
        <StatCell value={`${stats?.longestStreakDays ?? 0}d`} label={t('profile.history.longestStreak')} />
      </View>

      <Pressable
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={t('profile.history.toggleRecords')}
        className="flex-row items-center justify-between px-4 py-3.5 active:opacity-60"
      >
        <View className="flex-row items-center gap-3">
          <View className="h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${ACCENT}1A` }}>
            <Feather name="award" size={14} color={ACCENT} />
          </View>
          <Text className="font-body text-body text-primary-light dark:text-primary">{t('profile.history.personalRecords')}</Text>
        </View>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#A0A0A8" />
      </Pressable>

      {expanded && (
        <View className="gap-2 px-4 pb-4" style={{ paddingLeft: 56 }}>
          {stats?.personalRecords.length ? (
            stats.personalRecords.map((record) => (
              <View key={record.exerciseId} className="flex-row items-center justify-between">
                <Text className="font-body text-body text-secondary-light dark:text-secondary">{record.exerciseName}</Text>
                <Text className="font-body-semibold text-body text-green-neon">{Math.round(record.bestRepScore)}</Text>
              </View>
            ))
          ) : (
            <Text className="font-body text-small text-secondary-light dark:text-secondary">
              {t('profile.history.noRecords')}
            </Text>
          )}
        </View>
      )}
    </ProfileGroup>
  );
}
