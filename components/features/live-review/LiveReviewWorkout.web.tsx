import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import type { SessionConfig } from '@/hooks/usePoseSession';

interface LiveReviewWorkoutProps {
  config: SessionConfig;
  onExit: () => void;
}

// See the .native.tsx sibling for why this needs a platform split at all:
// @quickpose/react-native's native view uses codegenNativeComponent, which
// breaks Metro's web bundle at import time. usePoseSession also imports
// from that package (QuickPoseThresholdCounter, same module file as the
// native view), so it can't be imported here either — only as a type,
// which is erased and never reaches the web bundle graph.
export function LiveReviewWorkout({ config, onExit }: LiveReviewWorkoutProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
      <Text className="text-center font-display text-h2 text-primary">Live Review isn&apos;t available on web</Text>
      <Text className="text-center font-body text-body text-secondary">
        {config.exercise.name} needs your device&apos;s camera and native pose detection — open this app on your
        phone to try it.
      </Text>
      <Button label="Back" variant="secondary" onPress={onExit} />
    </View>
  );
}
