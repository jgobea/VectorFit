import { View } from 'react-native';

interface OnboardingProgressDotsProps {
  total: number;
  current: number;
}

// Dot pagination indicator per explicit user request — the active dot is a
// wider pill so progress reads at a glance without counting dots.
export function OnboardingProgressDots({ total, current }: OnboardingProgressDotsProps) {
  return (
    <View className="flex-row items-center gap-1.5" accessibilityLabel={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-2 rounded-full ${i === current ? 'w-5 bg-cyan-vivid' : 'w-2 bg-border-light dark:bg-border'}`}
        />
      ))}
    </View>
  );
}
