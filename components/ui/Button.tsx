import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import { GradientPrimary } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

// Min 48px touch target (DESIGN_SPEC.md accessibility) — h-14 (56px) gives
// headroom. Gradient CTA uses expo-linear-gradient, not NativeWind's
// from-*/to-* utilities: those only render on web (react-native-web), not on
// iOS/Android, since RN views have no native gradient primitive.
export function Button({ label, variant = 'primary', loading, disabled, ...pressableProps }: ButtonProps) {
  const isDisabled = disabled || loading;
  const commonA11y = {
    accessibilityRole: 'button' as const,
    accessibilityState: { disabled: isDisabled, busy: loading },
    disabled: isDisabled,
  };

  if (variant === 'secondary') {
    return (
      <Pressable
        {...commonA11y}
        {...pressableProps}
        className="h-14 flex-row items-center justify-center rounded-xl border border-border-light dark:border-border active:opacity-70 disabled:opacity-40"
      >
        {loading ? (
          <ActivityIndicator color="#00E5FF" />
        ) : (
          <Text className="font-body-semibold text-base text-primary-light dark:text-primary">{label}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable {...commonA11y} {...pressableProps} className="h-14 active:opacity-80 disabled:opacity-40">
      <LinearGradient
        colors={GradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: '100%', height: '100%', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
      >
        {loading ? (
          <ActivityIndicator color="#1C1C1E" />
        ) : (
          <Text className="font-body-semibold text-base text-[#1C1C1E]">{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}
