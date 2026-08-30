import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LegalText } from '@/components/features/legal/LegalText';
import { TERMS_AND_PRIVACY } from '@/content/legalContent';

// Outside both (auth) and (app) route groups — same precedent as
// app/routine-builder.tsx: a read-only screen reached via router.push, no
// tab bar, reachable pre-login (from login.tsx) as well as while signed in.
export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background" edges={['top']}>
      <View className="flex-row items-center gap-3 border-b border-border-light px-4 pb-3 pt-2 dark:border-border">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="h-11 w-11 items-center justify-center active:opacity-70"
        >
          <Feather name="x" size={24} color="#00E5FF" />
        </Pressable>
        <Text className="flex-1 font-display text-h3 text-primary-light dark:text-primary">Terms & Privacy</Text>
      </View>

      <ScrollView contentContainerClassName="gap-3 px-6 pb-10 pt-4">
        <LegalText content={TERMS_AND_PRIVACY} />
      </ScrollView>
    </SafeAreaView>
  );
}
