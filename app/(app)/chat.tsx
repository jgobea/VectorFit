import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';

// Minimal stub — Trainer AI Chat is INSTRUCTIONS.md page #3, built in its own
// approval-gated phase after Dashboard. This exists only so Dashboard's
// "Chat with Trainer" quick-access button isn't a dead end.
export default function ChatScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-background-light px-6 dark:bg-background">
      <Text className="text-center font-display text-h2 text-primary-light dark:text-primary">AI Trainer Chat</Text>
      <Text className="text-center font-body text-body text-secondary-light dark:text-secondary">
        Coming soon — this page is built next.
      </Text>
      <Button label="Back to Dashboard" variant="secondary" onPress={() => router.back()} />
    </SafeAreaView>
  );
}
