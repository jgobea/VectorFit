import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import type { DayActivity } from '@/types/progressStats';

interface ActivityStripProps {
  days: DayActivity[];
}

// Fixed 7-wide grid (two rows for a 14-day window) instead of one long row
// — a single row of 14 cells would either shrink to illegible squares on a
// narrow phone or force horizontal scrolling, both against the ask.
export function ActivityStrip({ days }: ActivityStripProps) {
  const { t } = useTranslation();
  const weekdayInitials = t('common.weekdayInitials', { returnObjects: true }) as string[];
  const weeks = [days.slice(0, 7), days.slice(7, 14)];

  return (
    <View className="gap-2">
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} className="flex-row gap-2">
          {week.map((day) => (
            <View key={day.dateKey} className="flex-1 items-center gap-1">
              <View
                className={`aspect-square w-full rounded-lg border ${
                  day.active
                    ? 'border-green-neon bg-green-neon/30'
                    : 'border-border-light dark:border-border'
                } ${day.isToday ? 'border-2 border-cyan-vivid' : ''}`}
              />
              <Text className="font-body text-small text-secondary-light dark:text-secondary">
                {weekdayInitials[day.dayOfWeek]}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
