import { Pressable, Text, View } from 'react-native';

import { DAY_LABELS_SHORT } from '@/types/routine';
import type { RoutineDay } from '@/types/routine';

interface DaySelectorProps {
  days: RoutineDay[];
  selectedDayId: string;
  onSelect: (dayId: string) => void;
}

// All 7 days at once, no horizontal scroll — each chip is an equal flex
// share of the row instead of a fixed width, so the whole week is visible
// (and Saturday isn't hidden off-screen) without needing a swipe to
// discover it. Sorted Sun..Sat to match day_of_week. Dot color: green =
// training day with exercises, amber = training day still empty, gray =
// rest day — a quick-glance status read of the week.
export function DaySelector({ days, selectedDayId, onSelect }: DaySelectorProps) {
  return (
    <View className="flex-row gap-1 px-4">
      {days.map((day) => {
        const selected = day.id === selectedDayId;
        const dotColor = day.is_rest_day ? '#A0A0A8' : day.exercises.length > 0 ? '#39FF14' : '#FFB800';

        return (
          <Pressable
            key={day.id}
            onPress={() => onSelect(day.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`h-14 flex-1 items-center justify-center gap-1.5 rounded-xl border ${
              selected ? 'border-cyan-vivid bg-cyan-vivid/15' : 'border-border-light dark:border-border'
            }`}
          >
            <Text
              className={`font-body-semibold text-small ${selected ? 'text-cyan-vivid' : 'text-primary-light dark:text-primary'}`}
              numberOfLines={1}
            >
              {DAY_LABELS_SHORT[day.day_of_week]}
            </Text>
            <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
          </Pressable>
        );
      })}
    </View>
  );
}
