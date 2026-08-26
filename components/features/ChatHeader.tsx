import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { InfoModal } from '@/components/ui/InfoModal';

// DESIGN_SPEC.md §C.1: title, "AI Trainer is online" status, info action.
// No back control — Chat is a top-level tab (app/(app)/_layout.tsx), same
// as Dashboard's header having none.
export function ChatHeader() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <View className="flex-row items-center justify-between border-b border-border-light px-4 pb-3 pt-2 dark:border-border">
      <View className="flex-1">
        <Text className="font-display text-h3 text-primary-light dark:text-primary" numberOfLines={1}>
          AI Trainer Chat
        </Text>
        <View className="flex-row items-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full bg-green-neon" />
          <Text className="font-body text-small text-secondary-light dark:text-secondary">AI Trainer is online</Text>
        </View>
      </View>
      <Pressable
        onPress={() => setInfoOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Trainer info"
        className="mr-2 h-11 w-11 items-center justify-center rounded-full border border-border-light active:opacity-70 dark:border-border"
      >
        <Feather name="info" size={18} color="#A0A0A8" />
      </Pressable>

      <InfoModal
        visible={infoOpen}
        title="About your AI Trainer"
        message="Ask about exercise form, routines, nutrition, or recovery. Advice is personalized to your profile and available anytime."
        onClose={() => setInfoOpen(false)}
      />
    </View>
  );
}
