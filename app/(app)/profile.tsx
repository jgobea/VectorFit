import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';

// Minimal stub — User Info is INSTRUCTIONS.md page #5, built last. Exists
// only so Dashboard's header profile icon isn't a dead end.
export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-background-light px-6 dark:bg-background">
      <Text className="text-center font-display text-h2 text-primary-light dark:text-primary">User Info</Text>
      <Text className="text-center font-body text-body text-secondary-light dark:text-secondary">
        Coming soon — this page is built last, per INSTRUCTIONS.md&apos;s order.
      </Text>
      <Button label="Back to Dashboard" variant="secondary" onPress={() => router.back()} />
    </SafeAreaView>
  );
}
