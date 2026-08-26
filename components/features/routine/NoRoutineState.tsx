import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Shown instead of both Today's Workout and Upcoming when the user has
// never created a routine — one honest empty state beats two, since
// "nothing scheduled today" and "no routine exists at all" read as the same
// blank sections otherwise.
export function NoRoutineState() {
  const router = useRouter();

  return (
    <Card className="items-center gap-3 py-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-cyan-vivid/10">
        <Feather name="frown" size={30} color="#00E5FF" />
      </View>
      <Text className="font-display text-h3 text-primary-light dark:text-primary">Oops, no routine yet</Text>
      <Text className="max-w-xs text-center font-body text-small text-secondary-light dark:text-secondary">
        Build a weekly routine and your Today and Upcoming workouts will show up here.
      </Text>
      <View className="mt-2 w-full max-w-xs">
        <Button label="Create Routine" onPress={() => router.push('/routine-builder')} />
      </View>
    </Card>
  );
}
