import { Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

interface ToastProps {
  message: string | null;
  onHide: () => void;
  durationMs?: number;
}

// DESIGN_SPEC.md §E "Success toast message after edits saved" — a plain
// auto-dismissing banner, not a full toast library (none is installed and
// this is the only place in the app that needs one so far).
export function Toast({ message, onHide, durationMs = 2500 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onHide]);

  if (!message) return null;

  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={{ position: 'absolute', bottom: 32, left: 24, right: 24, zIndex: 50 }}>
      <View className="flex-row items-center gap-2 rounded-xl border border-green-neon/40 bg-surface-light px-4 py-3 dark:bg-surface">
        <Feather name="check-circle" size={16} color="#39FF14" />
        <Text className="flex-1 font-body-medium text-small text-primary-light dark:text-primary">{message}</Text>
      </View>
    </Animated.View>
  );
}
