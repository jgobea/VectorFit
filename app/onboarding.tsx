import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingStepFrame } from '@/components/features/onboarding/OnboardingStepFrame';
import { AboutYouStep } from '@/components/features/onboarding/steps/AboutYouStep';
import { BodyStep } from '@/components/features/onboarding/steps/BodyStep';
import { CoachStyleStep } from '@/components/features/onboarding/steps/CoachStyleStep';
import { GoalsStep } from '@/components/features/onboarding/steps/GoalsStep';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { DEFAULT_ONBOARDING_DRAFT, type OnboardingDraft } from '@/types/onboarding';

// Gates "Next" per step, per explicit user request. Only checks fields
// that start out genuinely unset (null) — age/height/weight/coaching
// fields all carry sensible non-null defaults already, so there's nothing
// meaningful to require there; step 4 has no gate for the same reason.
function isStepComplete(step: number, draft: OnboardingDraft): boolean {
  switch (step) {
    case 0:
      return draft.full_name.trim().length > 0 && draft.gender !== null;
    case 1:
      return draft.body_type !== null;
    case 2:
      return draft.primary_goal !== null && draft.experience_level !== null;
    default:
      return true;
  }
}

// Outside both (auth) and (app) route groups on purpose — a full-screen
// wizard, no tab bar, no auth-stack chrome. Reached only via
// app/(app)/_layout.tsx's redirect when hooks/useOnboardingGate.ts finds
// onboarding_completed = false.
export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const setProfile = useUserStore((s) => s.setProfile);
  const userId = session?.user.id;

  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_ONBOARDING_DRAFT);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    // A user who already finished onboarding shouldn't be able to land
    // back here (e.g. hardware back button) — bounce them to Dashboard.
    supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data?.onboarding_completed) {
          router.replace('/(app)/dashboard');
          return;
        }
        setChecking(false);
      });
  }, [userId, router]);

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (checking) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background">
        <ActivityIndicator color="#00E5FF" />
      </SafeAreaView>
    );
  }

  const patchDraft = (patch: Partial<OnboardingDraft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const finish = async () => {
    if (!userId) return;
    setIsSaving(true);
    const { data } = await supabase
      .from('users')
      .update({ ...draft, onboarding_completed: true })
      .eq('id', userId)
      .select()
      .single();
    setIsSaving(false);
    if (data) setProfile(data);
    router.replace('/(app)/dashboard');
  };

  const steps = [
    { title: t('onboarding.aboutYou.title'), subtitle: t('onboarding.aboutYou.subtitle'), content: <AboutYouStep draft={draft} onChange={patchDraft} /> },
    {
      title: t('onboarding.body.title'),
      subtitle: t('onboarding.body.subtitle'),
      content: <BodyStep draft={draft} onChange={patchDraft} />,
    },
    { title: t('onboarding.goals.title'), subtitle: t('onboarding.goals.subtitle'), content: <GoalsStep draft={draft} onChange={patchDraft} /> },
    {
      title: t('onboarding.coachStyle.title'),
      subtitle: t('onboarding.coachStyle.subtitle'),
      content: <CoachStyleStep draft={draft} onChange={patchDraft} />,
    },
  ];
  const isLastStep = step === steps.length - 1;

  return (
    <OnboardingStepFrame
      step={step}
      totalSteps={steps.length}
      title={steps[step].title}
      subtitle={steps[step].subtitle}
      isLastStep={isLastStep}
      isSaving={isSaving}
      isNextEnabled={isStepComplete(step, draft)}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() => (isLastStep ? finish() : setStep((s) => s + 1))}
      onSkip={finish}
    >
      {steps[step].content}
    </OnboardingStepFrame>
  );
}
