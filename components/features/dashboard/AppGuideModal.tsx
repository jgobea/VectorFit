import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingProgressDots } from '@/components/features/onboarding/OnboardingProgressDots';
import { GUIDE_STEPS } from '@/constants/appGuide';
import { useLocaleStore } from '@/stores/localeStore';

interface AppGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

// Replaces the old placeholder notification bell — a real, useful control:
// a short tour of every page in the app (constants/appGuide.ts), one page
// per step, mirroring onboarding's wizard shell (dot pagination, one
// focused screen at a time). Shows only the current UI locale's text (not
// both languages at once — that reads better per explicit feedback), with
// large left/right arrow buttons as the primary way to page through it.
export function AppGuideModal({ visible, onClose }: AppGuideModalProps) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const [step, setStep] = useState(0);
  const isFirst = step === 0;
  const isLast = step === GUIDE_STEPS.length - 1;
  const current = GUIDE_STEPS[step];
  const text = locale === 'es' ? current.es : current.en;

  const handleClose = () => {
    onClose();
    // Reset for next time after the close animation, not before —
    // otherwise the last step's content flashes step 0 while sliding away.
    setTimeout(() => setStep(0), 300);
  };

  const goNext = () => (isLast ? handleClose() : setStep((s) => s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background">
        <View className="flex-row items-center justify-between px-6 pt-2">
          <View className="h-11 w-11" />
          <OnboardingProgressDots total={GUIDE_STEPS.length} current={step} />
          <Pressable
            onPress={handleClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            className="h-11 w-11 items-center justify-center active:opacity-70"
          >
            <Feather name="x" size={24} color="#A0A0A8" />
          </Pressable>
        </View>

        {/* flexGrow:1 + justify-center centers the content when it fits
            (most steps) and falls back to scrolling instead of clipping on
            shorter screens now that the copy runs several sentences long. */}
        <ScrollView contentContainerClassName="flex-grow items-center justify-center gap-8 px-8 py-4" showsVerticalScrollIndicator={false}>
          <View
            className="h-28 w-28 items-center justify-center rounded-full"
            style={{ backgroundColor: `${current.accentColor}1A` }}
          >
            <Feather name={current.icon} size={52} color={current.accentColor} />
          </View>

          {/* Capped width, not full-bleed — edge-to-edge lines at this font
              size were hard to read. Body text is justified, not centered:
              ragged-center line breaks are harder to scan for a paragraph
              this long. */}
          <View className="w-full max-w-sm gap-3 self-center">
            <Text className="text-center font-display text-h1 text-primary-light dark:text-primary">{text.title}</Text>
            {/* text-h3's size preset also carries fontWeight 700 — this
                paragraph is long-form body copy, not a heading, so its size
                is set directly instead of borrowing that bold preset. */}
            <Text
              className="font-body text-secondary-light dark:text-secondary"
              style={{ fontSize: 18, lineHeight: 27, textAlign: 'justify' }}
            >
              {text.body}
            </Text>
          </View>
        </ScrollView>

        {/* justify-center, not justify-between — the arrows sit as a
            centered pair, not pinned out to the row's own left/right edges.
            Explicit inline marginHorizontal, not a className utility (mx-6
            and gap-* both silently failed to produce any visible space
            here) — style props apply directly, with no NativeWind/cssInterop
            step in between that could swallow them. */}
        <View className="flex-row items-center justify-center pb-8 pt-2">
          <Pressable
            onPress={goBack}
            disabled={isFirst}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            className="h-16 w-16 items-center justify-center rounded-full border border-border-light active:opacity-70 disabled:opacity-0 dark:border-border"
            style={{ marginHorizontal: 28 }}
          >
            <Feather name="chevron-left" size={28} color="#00E5FF" />
          </Pressable>

          <Pressable
            onPress={goNext}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isLast ? t('common.done') : t('common.next')}
            className="h-16 w-16 items-center justify-center rounded-full active:opacity-80"
            style={{ backgroundColor: '#00E5FF', marginHorizontal: 28 }}
          >
            <Feather name={isLast ? 'check' : 'chevron-right'} size={28} color="#1C1C1E" />
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
