import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DaySelector } from '@/components/features/routine/DaySelector';
import { RoutineBuilderHeader } from '@/components/features/routine/RoutineBuilderHeader';
import { RoutineDayEditor } from '@/components/features/routine/RoutineDayEditor';
import { useRoutine } from '@/hooks/useRoutine';
import { useRoutineDayActions } from '@/hooks/useRoutineDayActions';
import { useAuthStore } from '@/stores/authStore';

// Outside both (auth) and (app) route groups on purpose — same precedent
// as app/onboarding.tsx: a full-screen flow reached via router.push, no tab
// bar. createIfMissing means both the empty-state "Create Routine" button
// and the "Edit Routine" quick-access tile can point here unconditionally.
export default function RoutineBuilderScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { routine, isLoading } = useRoutine({ createIfMissing: true });
  const { updateName } = useRoutineDayActions();
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

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
      <RoutineBuilderHeader name={routine.name} onSaveName={updateName} onBack={() => router.back()} />

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
    </SafeAreaView>
  );
}
