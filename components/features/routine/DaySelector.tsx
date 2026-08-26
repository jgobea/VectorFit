import { Pressable, ScrollView, Text, View } from 'react-native';

import { DAY_LABELS_SHORT } from '@/types/routine';
import type { RoutineDay } from '@/types/routine';

interface DaySelectorProps {
  days: RoutineDay[];
  selectedDayId: string;
  onSelect: (dayId: string) => void;
}

// Horizontal-scrolling chip row (fixed chip width, not flex-squeezed) so
// "Wed"/"Thu" never truncate on narrow phones. One per weekday, sorted
// Sun..Sat to match day_of_week. Dot color: green = training day with
// exercises, amber = training day still empty, gray = rest day — a
// quick-glance status read of the week.
export function DaySelector({ days, selectedDayId, onSelect }: DaySelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-6">
      {days.map((day) => {
        const selected = day.id === selectedDayId;
        const dotColor = day.is_rest_day ? '#A0A0A8' : day.exercises.length > 0 ? '#39FF14' : '#FFB800';

        return (
          <Pressable
            key={day.id}
            onPress={() => onSelect(day.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`h-14 w-16 items-center justify-center gap-1.5 rounded-xl border ${
              selected ? 'border-cyan-vivid bg-cyan-vivid/15' : 'border-border-light dark:border-border'
            }`}
          >
            <Text
              className={`font-body-semibold text-small ${selected ? 'text-cyan-vivid' : 'text-primary-light dark:text-primary'}`}
            >
              {DAY_LABELS_SHORT[day.day_of_week]}
            </Text>
            <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
