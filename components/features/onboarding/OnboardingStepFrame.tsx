import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgressDots } from '@/components/features/onboarding/OnboardingProgressDots';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface OnboardingStepFrameProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  isLastStep: boolean;
  isSaving: boolean;
  isNextEnabled: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  children: ReactNode;
}

// Shared wizard shell: back arrow (hidden on step 1), dot pagination, a
// "Skip" escape hatch on every step (nothing here is required — see
// types/onboarding.ts), one focused question group per screen, and a
// single full-width primary action so there's never more than one obvious
// next move.
export function OnboardingStepFrame({
  step,
  totalSteps,
  title,
  subtitle,
  isLastStep,
  isSaving,
  isNextEnabled,
  onBack,
  onNext,
  onSkip,
  children,
}: OnboardingStepFrameProps) {
  const { t } = useTranslation();
  const [skipConfirmOpen, setSkipConfirmOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background">
      <View className="flex-row items-center justify-between px-6 pt-2">
        {step > 0 ? (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            className="h-11 w-11 items-center justify-center active:opacity-70"
          >
            <Feather name="chevron-left" size={24} color="#00E5FF" />
          </Pressable>
        ) : (
          <View className="h-11 w-11" />
        )}

        <OnboardingProgressDots total={totalSteps} current={step} />

        <Pressable
          onPress={() => setSkipConfirmOpen(true)}
          hitSlop={8}
          accessibilityRole="button"
          className="h-11 justify-center px-1"
        >
          <Text className="font-body-medium text-small text-secondary-light dark:text-secondary">{t('onboarding.skip')}</Text>
        </Pressable>
      </View>

      {/* style, not className — KeyboardAvoidingView isn't wrapped by
          NativeWind, and Android needs an explicit 'height' behavior since
          SDK 54's edge-to-edge default breaks native window resize. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerClassName="flex-grow px-6 pb-6 pt-8" keyboardShouldPersistTaps="handled">
          <Text className="font-display text-h1 text-primary-light dark:text-primary">{title}</Text>
          <Text className="mb-8 mt-2 font-body text-body text-secondary-light dark:text-secondary">{subtitle}</Text>
          <View className="gap-6">{children}</View>
        </ScrollView>

        <View className="px-6 pb-4 pt-2">
          <Button
            label={isLastStep ? t('onboarding.getStarted') : t('common.next')}
            loading={isSaving}
            disabled={!isNextEnabled}
            onPress={onNext}
          />
        </View>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={skipConfirmOpen}
        title={t('onboarding.skipConfirmTitle')}
        message={t('onboarding.skipConfirmMessage')}
        confirmLabel={t('onboarding.skipAnyway')}
        destructive
        onCancel={() => setSkipConfirmOpen(false)}
        onConfirm={() => {
          setSkipConfirmOpen(false);
          onSkip();
        }}
      />
    </SafeAreaView>
  );
}
