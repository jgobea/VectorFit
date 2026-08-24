import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

// INSTRUCTIONS.md: "Camera requires a physical device — show a clear
// fallback UI on simulators." Checked once at module scope, not per-render.
const IS_PHYSICAL_DEVICE = Device.isDevice;

export default function LiveReviewScreen() {
  const router = useRouter();
  const [config, setConfig] = useState<SessionConfig | null>(null);

  if (!IS_PHYSICAL_DEVICE) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-background-light px-6 dark:bg-background">
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
    return <LiveReviewSetup onStart={setConfig} />;
  }

  return <LiveReviewWorkout config={config} onExit={() => setConfig(null)} />;
}
