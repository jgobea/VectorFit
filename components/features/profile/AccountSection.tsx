import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ChangePasswordModal } from '@/components/features/profile/ChangePasswordModal';
import { PrivacySettingsModal } from '@/components/features/profile/PrivacySettingsModal';
import { ProfileSection } from '@/components/features/profile/ProfileSection';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

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

// DESIGN_SPEC.md §E.7.
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
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  return (
    <ProfileSection title="Account">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="shrink-0 font-body text-body text-secondary-light dark:text-secondary">Email</Text>
        <Text
          className="flex-1 text-right font-body-semibold text-body text-primary-light dark:text-primary"
          numberOfLines={2}
        >
          {email}
        </Text>
      </View>

      <Pressable onPress={() => setPasswordModalOpen(true)} accessibilityRole="button" className="active:opacity-70">
        <Text className="font-body-semibold text-body text-cyan-vivid">Change password</Text>
      </Pressable>

      <Pressable onPress={() => setPrivacyModalOpen(true)} accessibilityRole="button" className="active:opacity-70">
        <Text className="font-body-semibold text-body text-cyan-vivid">Privacy settings</Text>
      </Pressable>

      <Pressable
        onPress={() => setLogoutConfirmOpen(true)}
        accessibilityRole="button"
        className="h-14 flex-row items-center justify-center rounded-xl bg-error/10 active:opacity-70"
      >
        <Feather name="log-out" size={18} color="#FF3B30" />
        <Text className="ml-2 font-body-semibold text-base text-error">Log Out</Text>
      </Pressable>

      <Pressable onPress={() => setDeleteConfirmOpen(true)} accessibilityRole="button" className="items-center py-1 active:opacity-70">
        <Text className="font-body text-small text-secondary-light dark:text-secondary">Delete account</Text>
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
        title="Log out?"
        message="You'll need to sign in again to access your account."
        confirmLabel="Log Out"
        isSubmitting={isLoggingOut}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={async () => {
          await onLogout();
          setLogoutConfirmOpen(false);
        }}
      />

      <ConfirmModal
        visible={deleteConfirmOpen}
        title="Delete account?"
        message="This permanently deletes your profile, workouts, chat history, and Live Review sessions. This can't be undone."
        confirmLabel="Delete Account"
        destructive
        isSubmitting={isDeleting}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={async () => {
          const success = await onDeleteAccount();
          if (success) setDeleteConfirmOpen(false);
        }}
      />
    </ProfileSection>
  );
}
