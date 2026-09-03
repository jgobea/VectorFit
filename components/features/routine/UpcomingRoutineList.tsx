import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { Card } from '@/components/ui/Card';
import { UpcomingRoutineDayRow } from '@/components/features/routine/UpcomingRoutineDayRow';
import type { ScheduledDay } from '@/lib/routineSchedule';

interface UpcomingRoutineListProps {
  days: ScheduledDay[];
}

// A plain mapped list, not FlashList — rows can expand/collapse and a rest
// day is shorter than a workout day, so a virtualized list with a guessed
// fixed row height either left empty space below short content or clipped
// expanded rows. This is a handful of items (max 6) inside an already
// non-scrolling Card, so there's nothing virtualization would buy here.
export function UpcomingRoutineList({ days }: UpcomingRoutineListProps) {
  const { t } = useTranslation();
  if (days.length === 0) {
    return (
      <Card className="items-center gap-1 py-6">
        <Text className="font-body text-body text-secondary-light dark:text-secondary">
          {t('dashboard.upcoming.empty')}
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      {days.map((scheduled) => (
        <UpcomingRoutineDayRow key={scheduled.day.id} scheduled={scheduled} />
      ))}
    </Card>
  );
}
