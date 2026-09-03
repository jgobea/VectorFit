import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Text, View } from 'react-native';

interface DashboardHeaderProps {
  greeting: string;
  avatarUrl: string | null;
}

// DESIGN_SPEC.md §B.1: sticky header — greeting, profile icon (→ User Info),
// notification bell. Wordmark reuses login's treatment (bold "vector" +
// light "Fit") so the brand mark is consistent app-wide. Notifications
// aren't a scoped feature yet, so the bell is a real, acknowledged control
// rather than an inert decoration.
export function DashboardHeader({ greeting, avatarUrl }: DashboardHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="px-6 pb-4 pt-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-h3">
          <Text className="font-display text-primary-light dark:text-primary">vector</Text>
          <Text className="font-body text-primary-light dark:text-primary">Fit</Text>
        </Text>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => Alert.alert(t('dashboard.notificationsTitle'), t('dashboard.notificationsMessage'))}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.notificationsTitle')}
            className="h-11 w-11 items-center justify-center rounded-full border border-border-light active:opacity-70 dark:border-border"
          >
            <Feather name="bell" size={20} color="#A0A0A8" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(app)/profile')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('nav.profile')}
            className="h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-cyan-vivid active:opacity-70"
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Feather name="user" size={20} color="#00E5FF" />
            )}
          </Pressable>
        </View>
      </View>

      <Text className="mt-3 font-display text-h2 text-primary-light dark:text-primary" numberOfLines={1}>
        {greeting}
      </Text>
    </View>
  );
}
