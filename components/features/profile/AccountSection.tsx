import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { ChangePasswordModal } from '@/components/features/profile/ChangePasswordModal';
import { PrivacySettingsModal } from '@/components/features/profile/PrivacySettingsModal';
import { ProfileGroup } from '@/components/features/profile/ProfileGroup';
import { ProfileRow } from '@/components/features/profile/ProfileRow';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';

interface AccountSectionProps {
  email: string;
  isChangingPassword: boolean;
  onChangePassword: (newPassword: string) => Promise<boolean>;
  isClearingChatHistory: boolean;
  onClearChatHistory: () => Promise<boolean>;
  isLoggingOut: boolean;
  onLogout: () => Promise<void>;
  isDeleting: boolean;
  onDeleteAccount: () => Promise<boolean>;
}

// Neutral gray, not one of the app's brand accents — this section is
// utilitarian (email, language, security actions), not a data section like
// the ones above it, so it deliberately doesn't compete with them for color.
const ACCENT = '#A0A0A8';

// DESIGN_SPEC.md §E.7. Log Out and Delete stay as their own prominent
// elements below the grouped list rather than rows inside it — the same
// convention iOS Settings uses for destructive actions, and a full-width
// button reads as the deliberate, weighty action it is instead of just
// another row to skim past.
export function AccountSection({
  email,
  isChangingPassword,
  onChangePassword,
  isClearingChatHistory,
  onClearChatHistory,
  isLoggingOut,
  onLogout,
  isDeleting,
  onDeleteAccount,
}: AccountSectionProps) {
  const { t } = useTranslation();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  return (
    <View className="gap-3">
      <ProfileGroup title={t('profile.account.title')}>
        <ProfileRow icon="mail" accentColor={ACCENT} label={t('login.email')} value={email} />
        <ProfileRow
          icon="globe"
          accentColor={ACCENT}
          label={t('language.label')}
          // Distinct from AITrainerSettingsSection's language_preference
          // field (that one only controls what language the AI coach
          // replies in) — this is the whole app's UI language, same switch
          // as Login's.
          right={<LanguageSwitch />}
        />
        <ProfileRow
          icon="lock"
          accentColor={ACCENT}
          label={t('profile.account.changePassword')}
          onPress={() => setPasswordModalOpen(true)}
        />
        <ProfileRow
          icon="shield"
          accentColor={ACCENT}
          label={t('profile.account.privacySettings')}
          onPress={() => setPrivacyModalOpen(true)}
        />
      </ProfileGroup>

      <Pressable
        onPress={() => setLogoutConfirmOpen(true)}
        accessibilityRole="button"
        className="h-14 flex-row items-center justify-center rounded-2xl bg-error/10 active:opacity-70"
      >
        <Feather name="log-out" size={18} color="#FF3B30" />
        <Text className="ml-2 font-body-semibold text-base text-error">{t('profile.account.logOut')}</Text>
      </Pressable>

      <Pressable onPress={() => setDeleteConfirmOpen(true)} accessibilityRole="button" className="items-center py-1 active:opacity-70">
        <Text className="font-body text-small text-secondary-light dark:text-secondary">
          {t('profile.account.deleteAccount')}
        </Text>
      </Pressable>

      <ChangePasswordModal
        visible={passwordModalOpen}
        isSubmitting={isChangingPassword}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={onChangePassword}
      />

      <PrivacySettingsModal
        visible={privacyModalOpen}
        isClearing={isClearingChatHistory}
        onClose={() => setPrivacyModalOpen(false)}
        onClearChatHistory={onClearChatHistory}
      />

      <ConfirmModal
        visible={logoutConfirmOpen}
        title={t('profile.account.logoutConfirmTitle')}
        message={t('profile.account.logoutConfirmMessage')}
        confirmLabel={t('profile.account.logOut')}
        isSubmitting={isLoggingOut}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={async () => {
          await onLogout();
          setLogoutConfirmOpen(false);
        }}
      />

      <ConfirmModal
        visible={deleteConfirmOpen}
        title={t('profile.account.deleteConfirmTitle')}
        message={t('profile.account.deleteConfirmMessage')}
        confirmLabel={t('profile.account.deleteAccount')}
        destructive
        isSubmitting={isDeleting}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={async () => {
          const success = await onDeleteAccount();
          if (success) setDeleteConfirmOpen(false);
        }}
      />
    </View>
  );
}
