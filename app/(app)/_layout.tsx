import { Feather } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { Redirect, Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useOnboardingGate } from '@/hooks/useOnboardingGate';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

// DESIGN_SPEC.md §B.5 offers "Grid or Bottom Navigation" for quick access —
// implemented as a persistent bottom tab bar across the app's four built
// pages, per explicit user request. The bar hides only once a Live Review
// camera session actually starts (uiStore.isLiveReviewActive, set by
// live-review.tsx) — not for the whole live-review route, which would trap
// a user on the pre-session setup screen with no way to reach another tab.
export default function AppLayout() {
  const session = useAuthStore((s) => s.session);
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme === 'light' ? 'light' : 'dark'];
  const isLiveReviewActive = useUiStore((s) => s.isLiveReviewActive);
  const onboardingStatus = useOnboardingGate(session?.user.id);
  const insets = useSafeAreaInsets();
  // This whole Tabs group stays mounted underneath full-screen routes pushed
  // on top of it (e.g. routine-builder, outside the group) — react-navigation
  // keeps prior stack screens alive for gesture-back. Without gating on
  // focus, tabBarHideOnKeyboard's keyboard listener kept firing there too,
  // animating the hidden tab bar in response to a keyboard it can't even
  // see, which read as an empty gray bar flashing at the bottom of those
  // other screens.
  const isTabsFocused = useIsFocused();

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (onboardingStatus === 'loading') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background">
        <ActivityIndicator color="#00E5FF" />
      </SafeAreaView>
    );
  }

  if (onboardingStatus === 'needed') {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      // Tells the bar's own internal layout to treat the bottom safe-area
      // inset as 0 (it otherwise pads its own content by insets.bottom,
      // baked inside the pill) — the real inset is applied once, below, to
      // the whole floating pill's position instead. Without this override,
      // the pill's rounded background was tall enough to visually extend
      // down into the phone's own 3-button nav bar row, even though the
      // tab icons themselves stayed clear of it.
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.cyanVivid,
        tabBarInactiveTintColor: theme.textSecondary,
        // Floating pill instead of a bar flush with the screen edge, per
        // explicit request. This has to be position: 'absolute' — leaving it
        // in normal flow (a margin/borderRadius'd box that still reserves
        // its own space) left React Navigation's own tab-bar-wrapping
        // container exposed as a plain dark-gray rectangle around the pill,
        // not matching this app's theme at all (that wrapper isn't
        // something tabBarStyle can recolor). Going absolute removes that
        // wrapper's reserved space entirely — the pill now floats directly
        // over each screen's own background instead. Every Tabs.Screen's
        // scrollable content adds paddingBottom via
        // useBottomTabBarHeight() so it doesn't end up hidden behind it.
        tabBarStyle: isLiveReviewActive
          ? { display: 'none' }
          : {
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: insets.bottom + 6,
              // An explicit height overrides RN Navigation's own default
              // calculation (49 + inset — with the inset now zeroed out via
              // safeAreaInsets above, that default alone read as too thin).
              height: 68,
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 24,
              elevation: 8,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
            },
        tabBarLabelStyle: { fontFamily: 'Inter-Medium', fontSize: 11 },
        // Without this, the tab bar keeps its reserved footer space when the
        // keyboard opens, which starves Chat's KeyboardAvoidingView of the
        // room it needs on Android and hides the message input behind the
        // keyboard. Hiding the bar whenever the keyboard is up fixes that
        // everywhere a screen has a text field near the bottom edge — but
        // only while this Tabs group is actually the focused route (see
        // isTabsFocused above).
        tabBarHideOnKeyboard: isTabsFocused,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Trainer',
          tabBarIcon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="live-review"
        options={{
          title: 'Live Review',
          tabBarIcon: ({ color, size }) => <Feather name="camera" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
