import { Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ToastProps {
  message: string | null;
  onHide: () => void;
  durationMs?: number;
}

// DESIGN_SPEC.md §E "Success toast message after edits saved" — a plain
// auto-dismissing banner, not a full toast library (none is installed and
// this is the only place in the app that needs one so far).
export function Toast({ message, onHide, durationMs = 2500 }: ToastProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onHide]);

  if (!message) return null;

  return (
    // Anchored to the top, not the bottom — the floating tab bar
    // (position: 'absolute' in app/(app)/_layout.tsx) covered a
    // bottom-anchored toast on every screen that has one.
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={{ position: 'absolute', top: insets.top + 12, left: 24, right: 24, zIndex: 50 }}
    >
      <View className="flex-row items-center gap-2 rounded-xl border border-green-neon/40 bg-surface-light px-4 py-3 dark:bg-surface">
        <Feather name="check-circle" size={16} color="#39FF14" />
        <Text className="flex-1 font-body-medium text-small text-primary-light dark:text-primary">{message}</Text>
      </View>
    </Animated.View>
  );
}
