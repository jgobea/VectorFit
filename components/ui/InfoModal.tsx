import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';

interface InfoModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

// Same shell as ConfirmModal, single "Got it" action — for info-only
// dialogs where there's nothing to confirm or cancel.
export function InfoModal({ visible, title, message, onClose }: InfoModalProps) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm gap-4 rounded-2xl border border-border-light bg-surface-light p-card dark:border-border dark:bg-surface"
        >
          <Text className="font-display text-h3 text-primary-light dark:text-primary">{title}</Text>
          <Text className="font-body text-body text-secondary-light dark:text-secondary">{message}</Text>
          <View className="pt-2">
            <Button label={t('common.gotIt')} onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
