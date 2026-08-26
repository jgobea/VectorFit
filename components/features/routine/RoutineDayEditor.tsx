import { useState } from 'react';
import { View } from 'react-native';

import { CopyDayModal } from '@/components/features/routine/CopyDayModal';
import { DayMenu } from '@/components/features/routine/DayMenu';
import { DayStatusToggle } from '@/components/features/routine/DayStatusToggle';
import { RestDayPanel } from '@/components/features/routine/RestDayPanel';
import { RoutineDayExercises } from '@/components/features/routine/RoutineDayExercises';
import { useRoutineDayActions } from '@/hooks/useRoutineDayActions';
import type { RoutineDay } from '@/types/routine';

interface RoutineDayEditorProps {
  day: RoutineDay;
  allDays: RoutineDay[];
}

// The content below the day selector chips for whichever day is currently
// selected: status toggle + "..." menu, then either the rest-day panel or
// the exercise list.
export function RoutineDayEditor({ day, allDays }: RoutineDayEditorProps) {
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const { setDayRestStatus, setDayNotes, clearDay, copyDay } = useRoutineDayActions();

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <DayStatusToggle isRestDay={day.is_rest_day} onChange={(isRestDay) => setDayRestStatus(day.id, isRestDay)} />
        </View>
        <DayMenu onCopyTo={() => setCopyModalOpen(true)} onClearDay={() => clearDay(day.id)} />
      </View>

      {day.is_rest_day ? (
        <RestDayPanel notes={day.notes} onSaveNotes={(notes) => setDayNotes(day.id, notes)} />
      ) : (
        <RoutineDayExercises day={day} />
      )}

      <CopyDayModal
        visible={copyModalOpen}
        sourceDayId={day.id}
        days={allDays}
        isCopying={isCopying}
        onClose={() => setCopyModalOpen(false)}
        onCopy={async (targetDayIds) => {
          setIsCopying(true);
          await copyDay(day.id, targetDayIds);
          setIsCopying(false);
          setCopyModalOpen(false);
        }}
      />
    </View>
  );
}
