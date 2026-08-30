import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { ScheduledDay } from '@/lib/routineSchedule';
import { DAY_LABELS_SHORT } from '@/types/routine';

const MONTH_LABELS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Hand-rolled instead of toLocaleDateString(undefined, {...}) — Hermes's
// Intl support is incomplete for some device locales and was silently
// dropping the month name (e.g. rendering "jue, 3 de" with nothing after
// "de"). This can't produce a partial string.
function formatDayLabel(date: Date): string {
  return `${DAY_LABELS_SHORT[date.getDay()]}, ${MONTH_LABELS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

interface UpcomingRoutineDayRowProps {
  scheduled: ScheduledDay;
}

// Mirrors UpcomingWorkoutRow (old scheduled_date model) for routine days —
// rest days collapse to a single line instead of an expandable preview.
export function UpcomingRoutineDayRow({ scheduled }: UpcomingRoutineDayRowProps) {
  const { date, day } = scheduled;
  const [expanded, setExpanded] = useState(false);
  const preview = day.exercises
    .slice(0, 3)
    .map((e) => e.exercise?.name)
    .filter(Boolean)
    .join(', ');

  if (day.is_rest_day) {
    return (
      <View className="flex-row items-center justify-between border-b border-border-light py-3.5 dark:border-border">
        <Text className="flex-1 pr-3 font-body-medium text-small text-cyan-vivid" numberOfLines={1}>
          {formatDayLabel(date)}
          {!!day.name && (
            <Text className="font-body-medium text-small text-primary-light dark:text-primary"> · {day.name}</Text>
          )}
        </Text>
        <Text className="font-body text-small text-secondary-light dark:text-secondary">Rest day</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      className="border-b border-border-light py-3.5 active:opacity-70 dark:border-border"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="font-body-medium text-small text-cyan-vivid" numberOfLines={1}>
            {formatDayLabel(date)}
            {!!day.name && (
              <Text className="font-body-medium text-small text-primary-light dark:text-primary"> · {day.name}</Text>
            )}
          </Text>
          {!expanded && (
            <Text className="mt-0.5 font-body text-small text-secondary-light dark:text-secondary" numberOfLines={1}>
              {preview || 'No exercises added yet'}
            </Text>
          )}
        </View>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#A0A0A8" />
      </View>

      {expanded && (
        <View className="mt-2 gap-1">
          {day.exercises.length === 0 && (
            <Text className="font-body text-small text-secondary-light dark:text-secondary">
              No exercises added yet.
            </Text>
          )}
          {day.exercises.map((e) => (
            <Text key={e.id} className="font-body text-small text-secondary-light dark:text-secondary">
              • {e.exercise?.name ?? 'Exercise'}
              {e.sets && e.reps ? ` — ${e.sets}×${e.reps}` : ''}
            </Text>
          ))}
        </View>
      )}
    </Pressable>
  );
}
