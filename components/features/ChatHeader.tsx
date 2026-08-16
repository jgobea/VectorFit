import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';

// DESIGN_SPEC.md §C.1: title, "AI Trainer is online" status, info action.
// Chat has no bottom-nav/tab entry — it's only reached via Dashboard's Quick
// Access — so a back control is required here, unlike Dashboard's header.
export function ChatHeader() {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between border-b border-border-light px-2 pb-3 pt-2 dark:border-border">
      <View className="flex-1 flex-row items-center gap-1">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back to Dashboard"
          className="h-11 w-11 items-center justify-center active:opacity-70"
        >
          <Feather name="chevron-left" size={24} color="#00E5FF" />
        </Pressable>
        <View className="flex-1">
          <Text className="font-display text-h3 text-primary-light dark:text-primary" numberOfLines={1}>
            AI Trainer Chat
          </Text>
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-green-neon" />
            <Text className="font-body text-small text-secondary-light dark:text-secondary">
              AI Trainer is online
            </Text>
          </View>
        </View>
      </View>
      <Pressable
        onPress={() =>
          Alert.alert(
            'About your AI Trainer',
            'Ask about exercise form, routines, nutrition, or recovery. Advice is personalized to your profile and available anytime.'
          )
        }
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Trainer info"
        className="mr-2 h-11 w-11 items-center justify-center rounded-full border border-border-light active:opacity-70 dark:border-border"
      >
        <Feather name="info" size={18} color="#A0A0A8" />
      </Pressable>
    </View>
  );
}
