import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';

interface RestTimerProps {
  restSeconds: number;
  nextSetNumber: number;
  onStartNextSet: () => void;
}

// Not in DESIGN_SPEC.md — added per explicit request: a countdown between
// sets, with a manual "Start Set N" button once it hits zero rather than
// auto-advancing, so the user decides when they're ready. Skipping early is
// also offered — no reason to force someone to wait out a full rest period.
export function RestTimer({ restSeconds, nextSetNumber, onStartNextSet }: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(restSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isDone = secondsLeft <= 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-6 px-6">
        <Text className="font-body-semibold text-body text-secondary">Rest</Text>
        <Text className="font-display text-primary" style={{ fontSize: 64, lineHeight: 72 }}>
          {minutes}:{String(seconds).padStart(2, '0')}
        </Text>
        <Button
          label={isDone ? `Start Set ${nextSetNumber}` : `Skip Rest — Start Set ${nextSetNumber}`}
          variant={isDone ? 'primary' : 'secondary'}
          onPress={onStartNextSet}
        />
      </View>
    </SafeAreaView>
  );
}
