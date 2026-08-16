import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { TypingIndicator } from '@/components/features/TypingIndicator';
import { Markdown } from '@/components/ui/Markdown';
import { GradientPrimary } from '@/constants/theme';
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

  const avatar = (
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

        <View className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
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
            <View className="rounded-[18px] rounded-bl-md bg-surface-light px-3.5 py-2.5 dark:bg-surface">
              {showTyping ? (
                <TypingIndicator />
              ) : (
                <Markdown
                  content={message.content}
                  className="font-body text-body text-primary-light dark:text-primary"
                />
              )}
            </View>
          )}
          <Text className="mt-1 font-body text-small text-secondary-light dark:text-secondary">
            {formatTime(message.created_at)}
          </Text>
        </View>

        {isUser && avatar}
      </View>
    </Animated.View>
  );
}
