import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';

interface QuickAccessItem {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}

// DESIGN_SPEC.md §B.5: 2x2 grid, icon + label. "View Progress" opens
// app/progress.tsx (stats + charts derived from routine_day_completions and
// pose_sessions). "Edit Routine" opens the routine builder
// (app/routine-builder.tsx), which creates one on the fly if the user
// doesn't have one yet.
//
// Two explicit flex-1 rows (not a wrapping flex row with % widths): a
// percentage-width + flex-wrap grid resizes/re-centers unpredictably across
// breakpoints since row width and item width are computed independently.
// Fixed rows keep every cell identical width at any viewport size —
// anti-ui-slop's product module: "same button shape... consistent
// affordances across the surface."
export function QuickAccessGrid() {
  const router = useRouter();
  const { t } = useTranslation();

  const items: QuickAccessItem[] = [
    { key: 'chat', icon: 'message-circle', label: t('dashboard.quickAccess.chat'), onPress: () => router.push('/(app)/chat') },
    { key: 'live', icon: 'camera', label: t('nav.liveReview'), onPress: () => router.push('/(app)/live-review') },
    {
      key: 'progress',
      icon: 'bar-chart-2',
      label: t('dashboard.quickAccess.viewProgress'),
      onPress: () => router.push('/progress'),
    },
    {
      key: 'routine',
      icon: 'edit-3',
      label: t('dashboard.quickAccess.editRoutine'),
      onPress: () => router.push('/routine-builder'),
    },
  ];

  const rows = [items.slice(0, 2), items.slice(2, 4)];

  return (
    <View className="gap-3">
      {rows.map((row, i) => (
        <View key={i} className="flex-row gap-3">
          {/* Pressable is flex-1 in a flex-row, so it already stretches to
              match the tallest sibling (e.g. a 2-line-wrapped label) — Card
              itself needs flex-1 + justify-center too, or its own box
              (border/background) stays sized to its own content and
              visibly falls short of that stretched height. */}
          {row.map((item) => (
            <Pressable key={item.key} onPress={item.onPress} className="flex-1 active:opacity-70">
              <Card className="flex-1 items-center justify-center gap-2 py-5">
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
