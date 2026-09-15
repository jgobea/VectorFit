import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { Card } from '@/components/ui/Card';

// Dashboard's outer content padding (px-6 = 24px/side) + the row gap
// (gap-3 = 12px) that this grid sits inside of — kept in sync with
// app/(app)/dashboard.tsx's "gap-section px-6" wrapper.
const SCREEN_PADDING_X = 24 * 2;
const ROW_GAP = 12;

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
  // An explicit pixel width, not `flex-1` — the same fix already applied to
  // ChatBubble.tsx and the bottom-sheet modals. On this screen the grid can
  // be the first flex-row content to mount (a brand-new account has no
  // routine yet, so the sections above it are still empty/loading), and
  // Android's Yoga has occasionally been caught resolving `flex-1` against
  // an ancestor whose own width isn't settled yet on that first frame,
  // collapsing/overlapping the two cards instead of placing them
  // side-by-side. A concrete width sidesteps that ambiguity entirely.
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = (screenWidth - SCREEN_PADDING_X - ROW_GAP) / 2;

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
          {/* flex-row's default cross-axis alignItems:'stretch' already
              matches Pressable's height to the tallest sibling (e.g. a
              2-line-wrapped label), independent of the explicit width above
              — Card itself still needs justify-center, or its own box
              (border/background) stays sized to its own content and
              visibly falls short of that stretched height. */}
          {row.map((item) => (
            <Pressable key={item.key} onPress={item.onPress} style={{ width: itemWidth }} className="active:opacity-70">
              <Card className="items-center justify-center gap-2 py-5">
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
