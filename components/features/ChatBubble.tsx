import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AddToRoutineModal } from '@/components/features/AddToRoutineModal';
import { ExerciseSuggestionCard } from '@/components/features/ExerciseSuggestionCard';
import { TypingIndicator } from '@/components/features/TypingIndicator';
import { Markdown } from '@/components/ui/Markdown';
import { GradientPrimary } from '@/constants/theme';
import { extractExerciseSuggestions, type SuggestedExercise } from '@/lib/exerciseSuggestion';
import { useUserStore } from '@/stores/userStore';
import type { ChatUIMessage } from '@/types/chat';

interface ChatBubbleProps {
  message: ChatUIMessage;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// DESIGN_SPEC.md §C.2 + §Visual Design: user bubbles use the primary
// gradient and sit right; AI trainer bubbles use the surface color and sit
// left; each has an avatar and a timestamp, with a subtle fade-in on arrival.
export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const showTyping = !isUser && !!message.isStreaming && message.content.length === 0;
  const userAvatarUrl = useUserStore((s) => s.profile?.avatar_url);
  const [selectedExercise, setSelectedExercise] = useState<SuggestedExercise | null>(null);

  // Only assistant replies can carry ```exercise blocks — never scan the
  // user's own message, which could itself legitimately contain that exact
  // text (e.g. asking "why did you suggest ```exercise blocks?").
  const { text: assistantText, exercises } = isUser
    ? { text: message.content, exercises: [] as SuggestedExercise[] }
    : extractExerciseSuggestions(message.content);
  // A reply that's only ```exercise block(s) — no surrounding prose — has
  // nothing left to show here once the block is stripped out; rendering
  // the bubble box anyway left an empty gray shape floating above the
  // card. Covers both the final state and every frame while it's still
  // streaming in (the block reads as empty text the whole time it's
  // incomplete, not just at the end).
  const hasBubbleText = showTyping || assistantText.trim().length > 0;

  // A plain `max-w-[78%]` here only ever gives this column an upper bound,
  // never a *definite* width — its own parent (this flex-row) has no fixed
  // width baked into it either, so nothing forces the column to actually
  // grow to fill that 78%. A text bubble doesn't care (it shrink-wraps to
  // its own content regardless), but ExerciseSuggestionCard's flex-1
  // sets/reps/rest columns and its name text do — without a real width to
  // divide up, Yoga fell back to sizing everything at its bare minimum,
  // wrapping the exercise name mid-word. An explicit pixel width (matching
  // chat.tsx's FlashList horizontal padding) resolves that for good.
  const { width: screenWidth } = useWindowDimensions();
  const columnWidth = (screenWidth - 32) * 0.78;

  const avatar =
    isUser && userAvatarUrl ? (
      <View className="h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-cyan-vivid">
        <Image source={{ uri: userAvatarUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      </View>
    ) : (
      <View
        className={`h-8 w-8 items-center justify-center rounded-full ${
          isUser ? 'bg-cyan-vivid/20' : 'border border-border-light dark:border-border'
        }`}
      >
        <Feather name={isUser ? 'user' : 'cpu'} size={15} color={isUser ? '#00E5FF' : '#A0A0A8'} />
      </View>
    );

  return (
    // The layout classes live on a plain View, not Animated.View: Reanimated's
    // Animated.View isn't registered with NativeWind's cssInterop, so a
    // className on it is silently a no-op — that's what was making this row
    // collapse to a column instead of laying out as a row at all.
    <Animated.View entering={FadeIn.duration(220)}>
      <View className={`mb-4 flex-row items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && avatar}

        <View className={isUser ? 'items-end' : 'items-start'} style={{ width: columnWidth }}>
          {isUser ? (
            <LinearGradient
              colors={GradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10 }}
            >
              <Text className="font-body text-body text-[#1C1C1E]">{message.content}</Text>
            </LinearGradient>
          ) : (
            hasBubbleText && (
              <View className="rounded-[18px] rounded-bl-md bg-surface-light px-3.5 py-2.5 dark:bg-surface">
                {showTyping ? (
                  <TypingIndicator />
                ) : (
                  <Markdown
                    content={assistantText}
                    className="font-body text-body text-primary-light dark:text-primary"
                  />
                )}
              </View>
            )
          )}

          {exercises.map((exercise, i) => (
            <ExerciseSuggestionCard key={i} exercise={exercise} onAdd={() => setSelectedExercise(exercise)} />
          ))}

          <Text className="mt-1 font-body text-small text-secondary-light dark:text-secondary">
            {formatTime(message.created_at)}
          </Text>
        </View>

        {isUser && avatar}
      </View>

      {selectedExercise && (
        <AddToRoutineModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      )}
    </Animated.View>
  );
}
