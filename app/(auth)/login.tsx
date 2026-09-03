import { Link } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';
import { useLogin } from '@/hooks/useLogin';

export default function LoginScreen() {
  const { t } = useTranslation();
  const {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    emailError,
    passwordError,
    formError,
    isSubmitting,
    canSubmit,
    onEmailBlur,
    onPasswordBlur,
    submit,
  } = useLogin();

  const passwordRef = useRef<TextInput>(null);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background" edges={['top', 'bottom']}>
      {/* className is a no-op on KeyboardAvoidingView — NativeWind doesn't
          register it for cssInterop. 'height' (not undefined) on Android:
          SDK 54's default edge-to-edge breaks windowSoftInputMode=resize,
          so Android needs its own explicit avoidance too — see chat.tsx
          for the full note. */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8 flex-row justify-end">
            <LanguageSwitch />
          </View>

          {/* Hero / wordmark — DESIGN_SPEC.md typography: bold "vector" + light "Fit" */}
          <View className="mb-12 items-center">
            <Text className="text-h1">
              <Text className="font-display text-primary-light dark:text-primary">vector</Text>
              <Text className="font-body text-primary-light dark:text-primary">Fit</Text>
            </Text>
            <Text className="mt-2 font-body text-body text-secondary-light dark:text-secondary">
              {t('login.tagline')}
            </Text>
          </View>

          <View className="gap-section">
            <Input
              label={t('login.email')}
              value={email}
              onChangeText={setEmail}
              onBlur={onEmailBlur}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="you@example.com"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Input
              ref={passwordRef}
              label={t('login.password')}
              value={password}
              onChangeText={setPassword}
              onBlur={onPasswordBlur}
              error={passwordError}
              isPassword
              autoComplete="password"
              textContentType="password"
              placeholder="••••••••"
              returnKeyType="done"
              onSubmitEditing={submit}
            />

            {formError && <Text className="text-center font-body text-small text-error">{formError}</Text>}

            <View className="flex-row items-center justify-between">
              <Checkbox label={t('login.rememberMe')} checked={rememberMe} onToggle={setRememberMe} />
              <Link href="/(auth)/forgot-password" asChild>
                <Text className="font-body text-small text-cyan-vivid">{t('login.forgotPassword')}</Text>
              </Link>
            </View>

            <Button label={t('login.submit')} onPress={submit} disabled={!canSubmit} loading={isSubmitting} />

            <Link href="/(auth)/signup" asChild>
              <Button label={t('login.signUp')} variant="secondary" />
            </Link>
          </View>

          <Text className="mt-12 text-center font-body text-small text-secondary-light dark:text-secondary">
            {t('login.termsPrefix')}{' '}
            <Link href="/terms" className="text-cyan-vivid">
              {t('login.termsLink')}
            </Link>
            .
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
