import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

// Minimal stub, same reasoning as signup.tsx — not one of the 5 scoped
// pages, exists only so Login's "Forgot Password?" link isn't a dead end.
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit() {
    setError(null);
    setIsSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    setIsSubmitting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSuccess(true);
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      {/* className is a no-op on KeyboardAvoidingView — NativeWind doesn't
          register it for cssInterop. 'height' (not undefined) on Android:
          SDK 54's default edge-to-edge breaks windowSoftInputMode=resize —
          see app/(app)/chat.tsx for the full note. */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName="flex-grow justify-center px-6" keyboardShouldPersistTaps="handled">
          <Text className="mb-8 text-center text-h2 font-display text-primary-light dark:text-primary">
            {t('forgotPassword.title')}
          </Text>

          {success ? (
            <Text className="text-center font-body text-body text-primary-light dark:text-primary">
              {t('forgotPassword.successMessage')}
            </Text>
          ) : (
            <View className="gap-section">
              <Input
                label={t('login.email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="you@example.com"
              />
              {error && <Text className="text-center font-body text-small text-error">{error}</Text>}
              <Button
                label={t('forgotPassword.submit')}
                onPress={submit}
                loading={isSubmitting}
                disabled={!email || isSubmitting}
              />
            </View>
          )}

          <View className="mt-6">
            <Button label={t('signup.backToLogin')} variant="secondary" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
