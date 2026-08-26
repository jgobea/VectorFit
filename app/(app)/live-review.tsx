import * as Device from 'expo-device';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { LiveReviewSetup } from '@/components/features/live-review/LiveReviewSetup';
// ESLint's import resolver doesn't do Metro's platform-suffix resolution
// (.native.tsx/.web.tsx) — tsc's moduleSuffixes (tsconfig.json) handles the
// real type-check; this is a real, resolvable-at-bundle-time module.
// eslint-disable-next-line import/no-unresolved
import { LiveReviewWorkout } from '@/components/features/live-review/LiveReviewWorkout';
import type { SessionConfig } from '@/hooks/usePoseSession';
import { useUiStore } from '@/stores/uiStore';

// INSTRUCTIONS.md: "Camera requires a physical device — show a clear
// fallback UI on simulators." Checked once at module scope, not per-render.
const IS_PHYSICAL_DEVICE = Device.isDevice;

export default function LiveReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    exerciseId?: string;
    routineExerciseId?: string;
    reps?: string;
    sets?: string;
    restSeconds?: string;
  }>();
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const setLiveReviewActive = useUiStore((s) => s.setLiveReviewActive);

  // Deep-linked from Today's Workout's camera button (TodaysRoutineSection)
  // — prefills LiveReviewSetup instead of making the user re-pick the
  // exercise and re-type sets/reps/rest that are already in their routine.
  const prefill =
    params.exerciseId && params.routineExerciseId
      ? {
          exerciseId: params.exerciseId,
          routineExerciseId: params.routineExerciseId,
          reps: params.reps ? Number(params.reps) : null,
          sets: params.sets ? Number(params.sets) : null,
          restSeconds: params.restSeconds ? Number(params.restSeconds) : null,
        }
      : null;

  // Hides app/(app)/_layout.tsx's tab bar only once an actual camera
  // session is on screen (config set) — not during this setup form, which
  // needs the tab bar as its only way back to another tab. Cleanup always
  // resets it, covering both a config change and unmounting this screen.
  useEffect(() => {
    setLiveReviewActive(config !== null);
    return () => setLiveReviewActive(false);
  }, [config, setLiveReviewActive]);

  if (!IS_PHYSICAL_DEVICE) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-background-light px-6 dark:bg-background" edges={['top']}>
        <Text className="text-center font-display text-h2 text-primary-light dark:text-primary">
          Physical Device Required
        </Text>
        <Text className="text-center font-body text-body text-secondary-light dark:text-secondary">
          Live Review uses your camera for real-time pose detection — simulators and emulators don&apos;t have one.
          Run this build on a real phone to try it.
        </Text>
        <Button label="Back to Dashboard" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (!config) {
    return <LiveReviewSetup onStart={setConfig} prefill={prefill} />;
  }

  return <LiveReviewWorkout config={config} onExit={() => router.replace('/(app)/dashboard')} />;
}
