import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { GoogleAuthButton } from '@/components/ui/GoogleAuthButton';
import { Input } from '@/components/ui/Input';
import { signInWithGoogle } from '@/lib/googleAuth';
import { supabase } from '@/lib/supabase';

// Same shape as hooks/useLogin.ts's inline validation — matches
// supabase/config.toml's minimum_password_length = 6.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// Minimal stub: Sign Up isn't one of the 5 pages INSTRUCTIONS.md scopes for
// this project, but DESIGN_SPEC.md's Login page lists a Sign Up CTA, so this
// exists just so that button isn't a dead end. Not run through the
// ui-radar/ui-slop-score/anti-ui-slop per-page workflow.
export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const isEmailValid = EMAIL_REGEX.test(email);
  const isPasswordValid = password.length >= MIN_PASSWORD_LENGTH;
  const doPasswordsMatch = password === confirmPassword;

  const emailError = emailTouched && !isEmailValid ? t('signup.emailError') : undefined;
  const passwordError = passwordTouched && !isPasswordValid ? t('signup.passwordError', { min: MIN_PASSWORD_LENGTH }) : undefined;
  const confirmError = confirmTouched && !doPasswordsMatch ? t('signup.confirmError') : undefined;

  const canSubmit = isEmailValid && isPasswordValid && doPasswordsMatch && acceptedTerms && !isSubmitting;

  async function submit() {
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);
    setError(null);

    if (!isEmailValid || !isPasswordValid || !doPasswordsMatch || !acceptedTerms) return;

    setIsSubmitting(true);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    setIsSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setSuccess(true);
  }

  // Same account-creation path as email/password (auth.users' trigger
  // creates the profile row either way) — gated behind the same terms
  // checkbox since it's still creating an account, not just logging in.
  async function submitWithGoogle() {
    setError(null);
    setIsGoogleSubmitting(true);
    const googleError = await signInWithGoogle();
    setIsGoogleSubmitting(false);
    if (googleError) setError(googleError);
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
            {t('signup.title')}
          </Text>

          {success ? (
            <View className="gap-section">
              <Text className="text-center font-body text-body text-primary-light dark:text-primary">
                {t('signup.successMessage')}
              </Text>
              <Button label={t('signup.backToLogin')} onPress={() => router.replace('/(auth)/login')} />
            </View>
          ) : (
            <View className="gap-section">
              <Input
                label={t('login.email')}
                value={email}
                onChangeText={setEmail}
                onBlur={() => setEmailTouched(true)}
                error={emailError}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                placeholder="you@example.com"
              />
              <Input
                label={t('login.password')}
                value={password}
                onChangeText={setPassword}
                onBlur={() => setPasswordTouched(true)}
                error={passwordError}
                isPassword
                placeholder="••••••••"
              />
              <Input
                label={t('signup.confirmPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => setConfirmTouched(true)}
                error={confirmError}
                isPassword
                placeholder="••••••••"
              />
              <View className="flex-row items-start gap-2">
                <View className="pt-0.5">
                  <Checkbox checked={acceptedTerms} onToggle={setAcceptedTerms} />
                </View>
                <Text className="flex-1 font-body text-small text-secondary-light dark:text-secondary">
                  {t('signup.termsPrefix')}{' '}
                  <Link href="/terms?from=signup" className="text-cyan-vivid">
                    {t('login.termsLink')}
                  </Link>
                  .
                </Text>
              </View>

              {error && <Text className="text-center font-body text-small text-error">{error}</Text>}
              <Button label={t('login.signUp')} onPress={submit} loading={isSubmitting} disabled={!canSubmit} />

              <View className="flex-row items-center gap-3">
                <View className="h-px flex-1 bg-border-light dark:bg-border" />
                <Text className="font-body text-small text-secondary-light dark:text-secondary">{t('common.orContinueWith')}</Text>
                <View className="h-px flex-1 bg-border-light dark:bg-border" />
              </View>

              <GoogleAuthButton onPress={submitWithGoogle} loading={isGoogleSubmitting} disabled={!acceptedTerms} />

              <Button label={t('signup.backToLogin')} variant="secondary" onPress={() => router.back()} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
