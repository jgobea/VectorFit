import { Text } from 'react-native';

import type { RoutineExercise } from '@/types/routine';

interface DayVolumeSummaryProps {
  exercises: RoutineExercise[];
}

// Small projected-volume line per day — the one piece of the "Kanban"
// alternative kept from the two design options, without the full weekly
// card-board layout.
export function DayVolumeSummary({ exercises }: DayVolumeSummaryProps) {
  if (exercises.length === 0) return null;

  const totalSets = exercises.reduce((sum, e) => sum + (e.sets ?? 0), 0);
  const exerciseWord = exercises.length === 1 ? 'exercise' : 'exercises';
  const setsWord = totalSets === 1 ? 'set' : 'sets';

  return (
    <Text className="font-body text-small text-secondary-light dark:text-secondary">
      {exercises.length} {exerciseWord} · {totalSets} {setsWord} total
    </Text>
  );
}
