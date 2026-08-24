import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

interface LiveReviewTopBarProps {
  exerciseName: string;
  onClose: () => void;
}

// DESIGN_SPEC.md §D.2: semi-transparent top bar, title + close button.
export function LiveReviewTopBar({ exerciseName, onClose }: LiveReviewTopBarProps) {
  return (
    <View className="flex-row items-center justify-between bg-black/40 px-4 py-3">
      <Text className="font-display text-h3 text-primary">Live Review: {exerciseName}</Text>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close live review"
        hitSlop={8}
        className="h-10 w-10 items-center justify-center rounded-full bg-black/30 active:opacity-70"
      >
        <Feather name="x" size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
