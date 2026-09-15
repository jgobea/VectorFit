import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';

interface QuickEditModalProps {
  visible: boolean;
  title: string;
  isSaving?: boolean;
  saveDisabled?: boolean;
  onCancel: () => void;
  onSave: () => void;
  children: ReactNode;
}

// Bottom sheet for editing a single Profile setting in place — tapping a
// ProfileRow opens this instead of switching the whole page into edit mode.
// Same shell as SelectModal (fade, not slide, on the Modal itself, with the
// sheet's own rise handled by Reanimated — see that file for why).
export function QuickEditModal({ visible, title, isSaving, saveDisabled, onCancel, onSave, children }: QuickEditModalProps) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      {/* 'height' (not undefined) on Android: SDK 54's default edge-to-edge
          breaks windowSoftInputMode=resize, so Android needs its own
          explicit avoidance too — see app/(app)/chat.tsx for the full note.
          Without this, the keyboard opening (e.g. the injuries text field)
          just covers the sheet instead of pushing it up above the keyboard. */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable className="flex-1 justify-end bg-black/60" onPress={onCancel}>
          <Animated.View entering={SlideInDown.duration(250)}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <SafeAreaView edges={['bottom']} className="rounded-t-3xl bg-background-light dark:bg-background">
                <View className="gap-5 px-5 pb-2 pt-5">
                  <Text className="font-display text-h3 text-primary-light dark:text-primary">{title}</Text>
                  {children}
                  <View className="flex-row gap-3 pt-2">
                    <View className="flex-1">
                      <Button label={t('common.cancel')} variant="secondary" onPress={onCancel} />
                    </View>
                    <View className="flex-1">
                      <Button label={t('common.saveChanges')} loading={isSaving} disabled={saveDisabled} onPress={onSave} />
                    </View>
                  </View>
                </View>
              </SafeAreaView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
