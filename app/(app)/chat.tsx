import { Feather } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatBubble } from '@/components/features/ChatBubble';
import { ChatErrorBanner } from '@/components/features/ChatErrorBanner';
import { ChatHeader } from '@/components/features/ChatHeader';
import { ChatInput } from '@/components/features/ChatInput';
import { QuickSuggestionPills } from '@/components/features/QuickSuggestionPills';
import { useChat } from '@/hooks/useChat';
import type { ChatUIMessage } from '@/types/chat';

export default function ChatScreen() {
  const { t } = useTranslation();
  const { messages, isLoading, isSending, error, sendMessage, retry, canRetry } = useChat();
  const listRef = useRef<FlashListRef<ChatUIMessage>>(null);
  // The tab bar floats (position: 'absolute' in app/(app)/_layout.tsx) now
  // instead of reserving its own space — without this, ChatInput would
  // render flush at the screen's bottom edge, right under the floating
  // pill, instead of clear of it.
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  // RN's KeyboardAvoidingView behavior="height" drives its shrink/grow via an
  // internal Animated-free height override that has a known Android edge
  // case: it can get stuck mid-transition (state.bottom resets to 0 but the
  // View's explicit height style doesn't visually revert), leaving a
  // permanent gap the size of the keyboard even after it's dismissed. Rather
  // than fight that component's internals, Android tracks the real keyboard
  // height directly and applies it as padding ourselves — fully
  // deterministic, no animation state to get stuck. iOS keeps
  // KeyboardAvoidingView's 'padding' behavior below, which doesn't have this
  // issue.
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => setAndroidKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setAndroidKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const chatBody = (
    <>
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#00E5FF" />
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3 px-10">
            <Feather name="message-circle" size={28} color="#A0A0A8" />
            <Text className="text-center font-body text-body text-secondary-light dark:text-secondary">
              {t('chat.emptyState')}
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
    </>
  );

  return (
    // 'bottom' dropped from edges: the Tabs bar below this screen already
    // covers the bottom safe-area inset — adding it here double-pads.
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background" edges={['top']}>
      <ChatHeader />

      {/*
        NativeWind doesn't register KeyboardAvoidingView for className/
        cssInterop support (same gotcha as Animated.View elsewhere in this
        project) — `className="flex-1"` was a silent no-op, so this view
        never actually stretched to fill the screen. Fixed with `style`.
      */}
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={{ flex: 1, paddingBottom: tabBarHeight + insets.bottom + 12 }}
          behavior="padding"
          keyboardVerticalOffset={8}
        >
          {chatBody}
        </KeyboardAvoidingView>
      ) : (
        <View
          style={{
            flex: 1,
            paddingBottom: androidKeyboardHeight > 0 ? androidKeyboardHeight : tabBarHeight + insets.bottom + 12,
          }}
        >
          {chatBody}
        </View>
      )}
    </SafeAreaView>
  );
}
