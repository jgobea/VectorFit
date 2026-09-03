import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

interface LiveReviewTopBarProps {
  exerciseName: string;
  onClose: () => void;
}

// DESIGN_SPEC.md §D.2: semi-transparent top bar, title + close button.
export function LiveReviewTopBar({ exerciseName, onClose }: LiveReviewTopBarProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between bg-black/40 px-4 py-3">
      {/* flex-1 (not natural width) — without it a long translated title had
          nothing forcing it to wrap and just overflowed past the screen
          edge instead. */}
      <Text className="flex-1 pr-3 font-display text-h3 text-primary">
        {t('liveReview.topBarTitle', { name: exerciseName })}
      </Text>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('liveReview.closeLiveReview')}
        hitSlop={8}
        className="h-10 w-10 items-center justify-center rounded-full bg-black/30 active:opacity-70"
      >
        <Feather name="x" size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
