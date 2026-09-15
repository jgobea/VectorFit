import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LegalText } from '@/components/features/legal/LegalText';
import { TERMS_AND_PRIVACY_EN, TERMS_AND_PRIVACY_ES } from '@/content/legalContent';
import { useLocaleStore } from '@/stores/localeStore';

// Outside both (auth) and (app) route groups — same precedent as
// app/routine-builder.tsx: a read-only screen reached via router.push, no
// tab bar, reachable pre-login (from login.tsx) as well as while signed in.
// Follows the app's UI language (LanguageSwitch/localeStore), not the AI
// trainer's separate language_preference — same distinction as everywhere
// else the two could be confused.
//
// `from` (?from=login|signup) says which (auth) screen opened this one.
// Plain router.back() isn't reliable here: since /terms lives outside the
// (auth) group's own Stack, popping back to it can land on that Stack's
// default screen (login) instead of wherever the user actually came from
// (e.g. signup, losing the form they were filling in). dismissTo(href)
// targets that screen explicitly, preserving its state if it's still in
// the stack.
export default function TermsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const locale = useLocaleStore((s) => s.locale);
  const content = locale === 'es' ? TERMS_AND_PRIVACY_ES : TERMS_AND_PRIVACY_EN;

  const close = () => {
    if (from === 'signup') {
      router.dismissTo('/(auth)/signup');
    } else if (from === 'login') {
      router.dismissTo('/(auth)/login');
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background" edges={['top']}>
      <View className="flex-row items-center gap-3 border-b border-border-light px-4 pb-3 pt-2 dark:border-border">
        <Pressable
          onPress={close}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          className="h-11 w-11 items-center justify-center active:opacity-70"
        >
          <Feather name="x" size={24} color="#00E5FF" />
        </Pressable>
        <Text className="flex-1 font-display text-h3 text-primary-light dark:text-primary">{t('terms.title')}</Text>
      </View>

      <ScrollView contentContainerClassName="gap-3 px-6 pb-10 pt-4">
        <LegalText content={content} />
      </ScrollView>
    </SafeAreaView>
  );
}
