import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { translateExerciseDescription, translateExerciseName } from '@/constants/exerciseCatalog';
import { useChatStore } from '@/stores/chatStore';
import type { Exercise } from '@/types/workout';

interface ExerciseDemoContentProps {
  exercise: Pick<Exercise, 'name' | 'image_url' | 'instructions'>;
  /** Called right before navigating to Chat, e.g. to close the modal hosting this. */
  onAskTrainer?: () => void;
}

// Body of an exercise demonstration: the animated GIF (exercises.image_url,
// in the exercise-demos Storage bucket), its one-line description, and an
// "Ask the trainer" button that opens Chat and sends a how-to question
// for this exercise. Shared by ExerciseDemoModal (routine builder,
// Dashboard) and inline at the bottom of Live Review's setup card.
export function ExerciseDemoContent({ exercise, onAskTrainer }: ExerciseDemoContentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const queueMessage = useChatStore((s) => s.queueMessage);
  const name = translateExerciseName(t, exercise.name);
  const description = translateExerciseDescription(t, exercise);

  const askTrainer = () => {
    queueMessage(t('exercises.demo.askPrompt', { name }));
    onAskTrainer?.();
    router.navigate('/(app)/chat');
  };

  return (
    <View className="gap-4">
      {/* White backing: the GIFs are drawn on white, so this keeps them from
          floating as a bright rectangle on the dark theme's surface. */}
      <View className="h-56 items-center justify-center overflow-hidden rounded-xl bg-white">
        {exercise.image_url && (
          <Image
            source={{ uri: exercise.image_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
            autoplay
            accessibilityLabel={t('exercises.demo.title', { name })}
          />
        )}
      </View>

      {!!description && (
        <Text className="font-body text-body text-secondary-light dark:text-secondary">{description}</Text>
      )}

      <Pressable
        onPress={askTrainer}
        accessibilityRole="button"
        className="h-12 flex-row items-center justify-center gap-2 rounded-xl border border-cyan-vivid/40 bg-cyan-vivid/10 active:opacity-70"
      >
        <Feather name="message-circle" size={16} color="#00E5FF" />
        <Text className="font-body-semibold text-body text-cyan-vivid">{t('exercises.demo.askTrainer')}</Text>
      </Pressable>
    </View>
  );
}
