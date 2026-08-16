import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  onPress?: PressableProps['onPress'];
}

// Shared surface primitive — DESIGN_SPEC.md §Spacing: 16px card padding,
// surface color lifts card off the screen background.
export function Card({ onPress, className = '', children, ...viewProps }: CardProps) {
  const base = `rounded-2xl border border-border-light bg-surface-light p-card dark:border-border dark:bg-surface ${className}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" className={`${base} active:opacity-70`}>
        {children}
      </Pressable>
    );
  }

  return (
    <View {...viewProps} className={base}>
      {children}
    </View>
  );
}
