import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { translateExerciseName } from '@/constants/exerciseCatalog';

interface ExerciseDemoButtonProps {
  exerciseName: string | null | undefined;
  onPress: () => void;
  /** Matches the size of the row's neighbouring icon buttons. */
  size?: 'sm' | 'md';
}

// Help icon that opens an exercise's demonstration. An icon, not a
// "Demonstration" label, because both rows it sits in (builder card header,
// Dashboard row) are already full; quiet cyan outline like the row's other
// action buttons so it doesn't compete with them.
export function ExerciseDemoButton({ exerciseName, onPress, size = 'md' }: ExerciseDemoButtonProps) {
  const { t } = useTranslation();
  const dimension = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('exercises.demo.open', { name: translateExerciseName(t, exerciseName) })}
      hitSlop={6}
      className={`${dimension} items-center justify-center rounded-full border border-cyan-vivid/25 active:opacity-70`}
    >
      <Feather name="help-circle" size={size === 'sm' ? 15 : 16} color="#00E5FF" />
    </Pressable>
  );
}
