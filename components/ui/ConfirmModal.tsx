import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Shared confirmation dialog — DESIGN_SPEC.md §E.7 calls for a confirmation
// modal before both logout and account deletion. `destructive` swaps the
// confirm button to the error color instead of the brand gradient.
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  destructive,
  isSubmitting,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onCancel}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm gap-4 rounded-2xl border border-border-light bg-surface-light p-card dark:border-border dark:bg-surface"
        >
          <Text className="font-display text-h3 text-primary-light dark:text-primary">{title}</Text>
          <Text className="font-body text-body text-secondary-light dark:text-secondary">{message}</Text>
          <View className="flex-row gap-3 pt-2">
            <View className="flex-1">
              <Button label={t('common.cancel')} variant="secondary" onPress={onCancel} />
            </View>
            <View className="flex-1">
              {destructive ? (
                <Pressable
                  onPress={onConfirm}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  className="h-14 items-center justify-center rounded-xl bg-error active:opacity-80 disabled:opacity-40"
                >
                  <Text className="font-body-semibold text-base text-white">{confirmLabel}</Text>
                </Pressable>
              ) : (
                <Button label={confirmLabel} loading={isSubmitting} onPress={onConfirm} />
              )}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
