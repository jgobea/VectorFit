import { Feather } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { Redirect, Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.cyanVivid,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: isLiveReviewActive
          ? { display: 'none' }
          : { backgroundColor: theme.surface, borderTopColor: theme.border },
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
