import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import type { RoutineExercise } from '@/types/routine';

interface DayVolumeSummaryProps {
  exercises: RoutineExercise[];
}

// Small projected-volume line per day — the one piece of the "Kanban"
// alternative kept from the two design options, without the full weekly
// card-board layout.
export function DayVolumeSummary({ exercises }: DayVolumeSummaryProps) {
  const { t } = useTranslation();
  if (exercises.length === 0) return null;

  const totalSets = exercises.reduce((sum, e) => sum + (e.sets ?? 0), 0);

  return (
    <Text className="font-body text-small text-secondary-light dark:text-secondary">
      {t('routineBuilder.volumeSummary', { exercises: exercises.length, sets: totalSets })}
    </Text>
  );
}
