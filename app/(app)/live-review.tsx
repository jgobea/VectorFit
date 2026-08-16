import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';

// Minimal stub — Trainer AI Live Review is INSTRUCTIONS.md page #4, built
// after Chat. Exists only so Dashboard's "Live Review" / "Start Workout"
// buttons aren't dead ends. QuickPose wiring is intentionally not started
// here — see HANDOFF.md's note on fetching the Exercises doc first.
export default function LiveReviewScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-background-light px-6 dark:bg-background">
      <Text className="text-center font-display text-h2 text-primary-light dark:text-primary">Live Review</Text>
      <Text className="text-center font-body text-body text-secondary-light dark:text-secondary">
        Coming soon — real-time form feedback lands in a later phase.
      </Text>
      <Button label="Back to Dashboard" variant="secondary" onPress={() => router.back()} />
    </SafeAreaView>
  );
}
