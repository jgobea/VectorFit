import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

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
// selected: this day's own name, status toggle + "..." menu, then either
// the rest-day panel or the exercise list. Naming lives at the day level
// (not a single routine-wide name) so Monday can be "Chest Day", Tuesday
// "Triceps Day", etc. — that name is what Today's Workout and Upcoming
// display now.
export function RoutineDayEditor({ day, allDays }: RoutineDayEditorProps) {
  const { t } = useTranslation();
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [nameDraft, setNameDraft] = useState(day.name ?? '');
  const nameDraftRef = useRef(nameDraft);
  const { updateDayName, setDayRestStatus, clearDay, copyDay } = useRoutineDayActions();

  // Keep a ref mirror of the draft so the effect below can read the latest
  // typed value from its cleanup, which closes over whatever was current
  // when the effect last ran — not the value at cleanup time.
  useEffect(() => {
    nameDraftRef.current = nameDraft;
  }, [nameDraft]);

  // Commits whatever's been typed for a day the moment you leave it —
  // switching to another day, or leaving the screen entirely (this only
  // runs on the way out, not per keystroke) — even if the field never
  // blurred. Without this, switching days before tapping away from the
  // field silently dropped the edit, and so did backing out of the screen
  // mid-edit.
  useEffect(() => {
    const dayId = day.id;
    const originalName = day.name ?? '';
    setNameDraft(originalName);
    nameDraftRef.current = originalName;
    return () => {
      const finalDraft = nameDraftRef.current.trim();
      if (finalDraft !== originalName) updateDayName(dayId, finalDraft);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day.id]);

  const commitName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed !== (day.name ?? '')) updateDayName(day.id, trimmed);
  };

  return (
    <View className="gap-4">
      <View className="h-11 flex-row items-center gap-2 rounded-xl border border-border-light px-3 dark:border-border">
        <TextInput
          value={nameDraft}
          onChangeText={setNameDraft}
          onBlur={commitName}
          placeholder={t('routineBuilder.dayNamePlaceholder')}
          placeholderTextColor="#A0A0A8"
          style={{ paddingVertical: 0, includeFontPadding: false }}
          className="flex-1 font-body-semibold text-body text-primary-light dark:text-primary"
          accessibilityLabel={t('routineBuilder.dayName')}
        />
        <Feather name="edit-2" size={15} color="#A0A0A8" />
      </View>

      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <DayStatusToggle isRestDay={day.is_rest_day} onChange={(isRestDay) => setDayRestStatus(day.id, isRestDay)} />
        </View>
        <DayMenu onCopyTo={() => setCopyModalOpen(true)} onClearDay={() => clearDay(day.id)} />
      </View>

      {day.is_rest_day ? (
        <RestDayPanel />
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
