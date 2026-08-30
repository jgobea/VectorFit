import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

interface RoutineBuilderHeaderProps {
  onDiscard: () => void;
  onDone: () => void;
}

// Sticky top bar — the back arrow discards this session's edits (with a
// confirmation if anything actually changed — see routine-builder.tsx),
// Done keeps them. No editable name here: naming moved to the day level
// (each day of the week has its own name now), edited in RoutineDayEditor.
export function RoutineBuilderHeader({ onDiscard, onDone }: RoutineBuilderHeaderProps) {
  return (
    <View className="flex-row items-center gap-3 border-b border-border-light px-4 pb-3 pt-2 dark:border-border">
      <Pressable
        onPress={onDiscard}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Discard and go back"
        className="h-11 w-11 items-center justify-center active:opacity-70"
      >
        <Feather name="chevron-left" size={24} color="#00E5FF" />
      </Pressable>

      <Text className="flex-1 font-display text-h3 text-primary-light dark:text-primary">Weekly Routine</Text>

      <Pressable
        onPress={onDone}
        accessibilityRole="button"
        className="h-11 items-center justify-center rounded-xl bg-cyan-vivid px-4 active:opacity-80"
      >
        <Text className="font-body-semibold text-small text-[#1C1C1E]">Done</Text>
      </Pressable>
    </View>
  );
}
