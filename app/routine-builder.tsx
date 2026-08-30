import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DaySelector } from '@/components/features/routine/DaySelector';
import { RoutineBuilderHeader } from '@/components/features/routine/RoutineBuilderHeader';
import { RoutineDayEditor } from '@/components/features/routine/RoutineDayEditor';
import { useRoutine } from '@/hooks/useRoutine';
import { dayFingerprint, useRoutineDayActions } from '@/hooks/useRoutineDayActions';
import { useAuthStore } from '@/stores/authStore';
import type { RoutineDay } from '@/types/routine';

// Outside both (auth) and (app) route groups on purpose — same precedent
// as app/onboarding.tsx: a full-screen flow reached via router.push, no tab
// bar. createIfMissing means both the empty-state "Create Routine" button
// and the "Edit Routine" quick-access tile can point here unconditionally.
export default function RoutineBuilderScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { routine, isLoading } = useRoutine({ createIfMissing: true });
  const { revertToSnapshot } = useRoutineDayActions();
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [isReverting, setIsReverting] = useState(false);

  // Captured once, the first time the routine finishes loading — the
  // baseline that "discard" reverts back to. Field edits below still
  // autosave to Supabase as you make them (unchanged from before), but
  // leaving via the back arrow (or Android's hardware back) now undoes
  // whatever changed since this snapshot instead of keeping it — only Done
  // keeps edits.
  const snapshotRef = useRef<RoutineDay[] | null>(null);
  useEffect(() => {
    if (routine && !snapshotRef.current) {
      snapshotRef.current = JSON.parse(JSON.stringify(routine.days)) as RoutineDay[];
    }
  }, [routine]);

  const hasChanges = useCallback(() => {
    if (!routine || !snapshotRef.current) return false;
    return routine.days.some((day) => {
      const snap = snapshotRef.current!.find((d) => d.id === day.id);
      return !snap || dayFingerprint(day) !== dayFingerprint(snap);
    });
  }, [routine]);

  const requestDiscard = useCallback(() => {
    if (hasChanges()) {
      setConfirmDiscardOpen(true);
    } else {
      router.back();
    }
  }, [hasChanges, router]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      requestDiscard();
      return true;
    });
    return () => sub.remove();
  }, [requestDiscard]);

  const confirmDiscard = async () => {
    if (snapshotRef.current) {
      setIsReverting(true);
      await revertToSnapshot(snapshotRef.current);
      setIsReverting(false);
    }
    setConfirmDiscardOpen(false);
    router.back();
  };

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isLoading || !routine) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background">
        <ActivityIndicator color="#00E5FF" />
      </SafeAreaView>
    );
  }

  const todayDow = new Date().getDay();
  const activeDayId = selectedDayId ?? routine.days.find((d) => d.day_of_week === todayDow)?.id ?? routine.days[0].id;
  const activeDay = routine.days.find((d) => d.id === activeDayId) ?? routine.days[0];

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background" edges={['top']}>
      <RoutineBuilderHeader onDiscard={requestDiscard} onDone={() => router.back()} />

      {/* style, not className — KeyboardAvoidingView isn't wrapped by
          NativeWind; Android needs explicit 'height', see chat.tsx. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerClassName="gap-4 pb-10 pt-4" keyboardShouldPersistTaps="handled">
          <DaySelector days={routine.days} selectedDayId={activeDayId} onSelect={setSelectedDayId} />
          <View className="px-6">
            <RoutineDayEditor day={activeDay} allDays={routine.days} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={confirmDiscardOpen}
        title="Discard changes?"
        message="You've made changes since opening this screen. Going back without Done will undo them."
        confirmLabel="Discard"
        destructive
        isSubmitting={isReverting}
        onConfirm={confirmDiscard}
        onCancel={() => setConfirmDiscardOpen(false)}
      />
    </SafeAreaView>
  );
}
