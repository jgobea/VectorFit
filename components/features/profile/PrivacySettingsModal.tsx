import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text } from 'react-native';

import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface PrivacySettingsModalProps {
  visible: boolean;
  isClearing: boolean;
  onClose: () => void;
  onClearChatHistory: () => Promise<boolean>;
}

// Built per explicit user request — DESIGN_SPEC.md only lists "Privacy
// settings link" with no defined content. Scoped to what this app actually
// does with user data: Trainer AI Chat messages are sent to Google Gemini
// to generate replies (see supabase/functions/chat/index.ts) and stored in
// chat_messages until cleared or the account is deleted. Live Review does
// not record video yet (pose_sessions.recorded/video_url exist in the
// schema but nothing sets them) — no camera-recording toggle belongs here
// until that's a real feature.
export function PrivacySettingsModal({ visible, isClearing, onClose, onClearChatHistory }: PrivacySettingsModalProps) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm gap-4 rounded-2xl border border-border-light bg-surface-light p-card dark:border-border dark:bg-surface"
        >
          <Text className="font-display text-h3 text-primary-light dark:text-primary">{t('profile.privacy.title')}</Text>

          <Text className="font-body text-body text-secondary-light dark:text-secondary">
            {t('profile.privacy.chatMessage')}
          </Text>
          <Text className="font-body text-body text-secondary-light dark:text-secondary">
            {t('profile.privacy.cameraMessage')}
          </Text>

          <Pressable
            onPress={() => setConfirmOpen(true)}
            accessibilityRole="button"
            className="h-14 items-center justify-center rounded-xl bg-error/10 active:opacity-70"
          >
            <Text className="font-body-semibold text-base text-error">{t('profile.privacy.clearChatHistory')}</Text>
          </Pressable>

          <Pressable onPress={onClose} accessibilityRole="button" className="items-center py-1 active:opacity-70">
            <Text className="font-body-semibold text-body text-cyan-vivid">{t('common.done')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>

      <ConfirmModal
        visible={confirmOpen}
        title={t('profile.privacy.clearConfirmTitle')}
        message={t('profile.privacy.clearConfirmMessage')}
        confirmLabel={t('profile.privacy.clearHistoryConfirm')}
        destructive
        isSubmitting={isClearing}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          const success = await onClearChatHistory();
          if (success) setConfirmOpen(false);
        }}
      />
    </Modal>
  );
}
