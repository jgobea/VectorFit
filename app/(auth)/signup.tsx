import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

// Minimal stub: Sign Up isn't one of the 5 pages INSTRUCTIONS.md scopes for
// this project, but DESIGN_SPEC.md's Login page lists a Sign Up CTA, so this
// exists just so that button isn't a dead end. Not run through the
// ui-radar/ui-slop-score/anti-ui-slop per-page workflow.
export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit() {
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow justify-center px-6" keyboardShouldPersistTaps="handled">
          <Text className="mb-8 text-center text-h2 font-display text-primary-light dark:text-primary">
            Create your account
          </Text>

          {success ? (
            <Text className="text-center font-body text-body text-primary-light dark:text-primary">
              Check your email to confirm your account, then log in.
            </Text>
          ) : (
            <View className="gap-section">
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="you@example.com"
              />
              <Input label="Password" value={password} onChangeText={setPassword} isPassword placeholder="••••••••" />
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                placeholder="••••••••"
              />
              {error && <Text className="text-center font-body text-small text-error">{error}</Text>}
              <Button
                label="Sign Up"
                onPress={submit}
                loading={isSubmitting}
                disabled={!email || !password || isSubmitting}
              />
              <Button label="Back to Login" variant="secondary" onPress={() => router.back()} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
