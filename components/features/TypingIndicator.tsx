import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0.3, { duration: 300 })), -1, true)
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={style} className="h-2 w-2 rounded-full bg-secondary-light dark:bg-secondary" />;
}

// DESIGN_SPEC.md §C.5: "AI Trainer is typing..." — shown as animated dots in
// place of the assistant bubble's text while a reply is streaming in but no
// text has arrived yet.
export function TypingIndicator() {
  return (
    <View className="flex-row items-center gap-1.5 py-1.5">
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}
