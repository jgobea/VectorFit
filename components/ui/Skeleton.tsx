import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

interface SkeletonProps {
  className?: string;
}

// A pulsing placeholder block — the same opacity-pulse technique as
// TypingIndicator's dots, generalized into a reusable rectangle for loading
// states that need to reserve real estate before their data arrives.
export function Skeleton({ className = '' }: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(0.8, { duration: 700 }), withTiming(0.4, { duration: 700 })), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={animatedStyle} className={`rounded-md bg-border-light dark:bg-border ${className}`} />;
}
