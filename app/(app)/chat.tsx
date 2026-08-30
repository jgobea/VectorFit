import { Feather } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatBubble } from '@/components/features/ChatBubble';
import { ChatErrorBanner } from '@/components/features/ChatErrorBanner';
import { ChatHeader } from '@/components/features/ChatHeader';
import { ChatInput } from '@/components/features/ChatInput';
import { QuickSuggestionPills } from '@/components/features/QuickSuggestionPills';
import { useChat } from '@/hooks/useChat';
import type { ChatUIMessage } from '@/types/chat';

export default function ChatScreen() {
  const { messages, isLoading, isSending, error, sendMessage, retry, canRetry } = useChat();
  const listRef = useRef<FlashListRef<ChatUIMessage>>(null);
  // The tab bar floats (position: 'absolute' in app/(app)/_layout.tsx) now
  // instead of reserving its own space — without this, ChatInput would
  // render flush at the screen's bottom edge, right under the floating
  // pill, instead of clear of it.
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    // 'bottom' dropped from edges: the Tabs bar below this screen already
    // covers the bottom safe-area inset — adding it here double-pads.
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background" edges={['top']}>
      <ChatHeader />

      {/*
        Two stacked bugs here, both real:
        1. NativeWind doesn't register KeyboardAvoidingView for className/
           cssInterop support (same gotcha as Animated.View elsewhere in
           this project) — `className="flex-1"` was a silent no-op, so this
           view never actually stretched to fill the screen. Fixed with
           `style`.
        2. `behavior={undefined}` on Android used to be correct (rely on
           `windowSoftInputMode="adjustResize"` to resize the window
           natively) but Expo SDK 54 turns Android edge-to-edge ON by
           default, which breaks that native resize — the keyboard now
           just overlays the screen with nothing shifting, hiding
           ChatInput completely rather than merely mis-sizing it. 'height'
           behavior sidesteps this: it measures the keyboard via JS events
           and shrinks itself directly, independent of window resize.
      */}
      <KeyboardAvoidingView
        style={{ flex: 1, paddingBottom: tabBarHeight + insets.bottom + 12 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View className="flex-1">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#00E5FF" />
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center gap-3 px-10">
              <Feather name="message-circle" size={28} color="#A0A0A8" />
              <Text className="text-center font-body text-body text-secondary-light dark:text-secondary">
                Ask about form, routines, nutrition, or recovery — your trainer is ready.
              </Text>
            </View>
          ) : (
            <FlashList
              ref={listRef}
              data={messages}
              renderItem={({ item }) => <ChatBubble message={item} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
            />
          )}
        </View>

        {error && <ChatErrorBanner message={error} onRetry={canRetry ? retry : undefined} />}

        <QuickSuggestionPills onSelect={sendMessage} disabled={isSending} />
        <ChatInput onSend={sendMessage} disabled={isSending} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
