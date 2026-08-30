import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const isEmailValid = EMAIL_REGEX.test(email);
  const isPasswordValid = password.length >= MIN_PASSWORD_LENGTH;
  const doPasswordsMatch = password === confirmPassword;

  const emailError = emailTouched && !isEmailValid ? 'Enter a valid email address' : undefined;
  const passwordError =
    passwordTouched && !isPasswordValid ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters` : undefined;
  const confirmError = confirmTouched && !doPasswordsMatch ? 'Passwords do not match' : undefined;

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
            Create your account
          </Text>

          {success ? (
            <View className="gap-section">
              <Text className="text-center font-body text-body text-primary-light dark:text-primary">
                Check your email to confirm your account, then log in.
              </Text>
              <Button label="Back to Login" onPress={() => router.replace('/(auth)/login')} />
            </View>
          ) : (
            <View className="gap-section">
              <Input
                label="Email"
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
                label="Password"
                value={password}
                onChangeText={setPassword}
                onBlur={() => setPasswordTouched(true)}
                error={passwordError}
                isPassword
                placeholder="••••••••"
              />
              <Input
                label="Confirm Password"
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
                  I&apos;ve read and agree to the{' '}
                  <Link href="/terms" className="text-cyan-vivid">
                    Terms of Service and Privacy Policy
                  </Link>
                  .
                </Text>
              </View>

              {error && <Text className="text-center font-body text-small text-error">{error}</Text>}
              <Button label="Sign Up" onPress={submit} loading={isSubmitting} disabled={!canSubmit} />
              <Button label="Back to Login" variant="secondary" onPress={() => router.back()} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
