import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';

interface QuickAccessItem {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}

// DESIGN_SPEC.md §B.5: 2x2 grid, icon + label. "View Progress" isn't among
// INSTRUCTIONS.md's 5 scoped pages — it still responds (not inert), just
// with an honest "coming soon" instead of a route. "Edit Routine" opens the
// routine builder (app/routine-builder.tsx), which creates one on the fly
// if the user doesn't have one yet.
//
// Two explicit flex-1 rows (not a wrapping flex row with % widths): a
// percentage-width + flex-wrap grid resizes/re-centers unpredictably across
// breakpoints since row width and item width are computed independently.
// Fixed rows keep every cell identical width at any viewport size —
// anti-ui-slop's product module: "same button shape... consistent
// affordances across the surface."
export function QuickAccessGrid() {
  const router = useRouter();

  const items: QuickAccessItem[] = [
    { key: 'chat', icon: 'message-circle', label: 'Chat with Trainer', onPress: () => router.push('/(app)/chat') },
    { key: 'live', icon: 'camera', label: 'Live Review', onPress: () => router.push('/(app)/live-review') },
    {
      key: 'progress',
      icon: 'bar-chart-2',
      label: 'View Progress',
      onPress: () => Alert.alert('Coming soon', 'Progress tracking isn’t built yet.'),
    },
    {
      key: 'routine',
      icon: 'edit-3',
      label: 'Edit Routine',
      onPress: () => router.push('/routine-builder'),
    },
  ];

  const rows = [items.slice(0, 2), items.slice(2, 4)];

  return (
    <View className="gap-3">
      {rows.map((row, i) => (
        <View key={i} className="flex-row gap-3">
          {row.map((item) => (
            <Pressable key={item.key} onPress={item.onPress} className="flex-1 active:opacity-70">
              <Card className="items-center gap-2 py-5">
                <Feather name={item.icon} size={22} color="#00E5FF" />
                <Text className="text-center font-body-semibold text-small text-primary-light dark:text-primary">
                  {item.label}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
