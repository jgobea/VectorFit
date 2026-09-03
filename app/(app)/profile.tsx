import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, BackHandler, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountSection } from '@/components/features/profile/AccountSection';
import { AITrainerSettingsSection } from '@/components/features/profile/AITrainerSettingsSection';
import { FitnessInfoSection } from '@/components/features/profile/FitnessInfoSection';
import { PhysicalStatsSection } from '@/components/features/profile/PhysicalStatsSection';
import { ProfileHeaderSection } from '@/components/features/profile/ProfileHeaderSection';
import { WorkoutHistorySection } from '@/components/features/profile/WorkoutHistorySection';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast } from '@/components/ui/Toast';
import { useAccountActions } from '@/hooks/useAccountActions';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useClearChatHistory } from '@/hooks/useClearChatHistory';
import { useProfile } from '@/hooks/useProfile';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const email = useAuthStore((s) => s.user?.email) ?? '—';

  const {
    profile,
    draft,
    isLoading,
    isSaving,
    isEditing,
    hasUnsavedChanges,
    error,
    successMessage,
    clearSuccess,
    startEditing,
    cancelEditing,
    patchDraft,
    save,
  } = useProfile();
  const { pickAvatar, isUploading } = useAvatarUpload(userId);
  const { stats } = useProfileStats(userId);
  const { changePassword, isChangingPassword, logout, isLoggingOut, deleteAccount, isDeleting } = useAccountActions();
  const { clearChatHistory, isClearing: isClearingChatHistory } = useClearChatHistory(userId);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  // The tab bar floats (position: 'absolute' in app/(app)/_layout.tsx) now
  // instead of reserving its own space — both the scroll content and the
  // edit-mode footer below need their own clearance so neither ends up
  // hidden behind the pill.
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  // Cancel button and Android's hardware back both go through here while
  // editing — only the ones that actually changed something get a
  // confirmation, so a no-op "tap edit, tap cancel" stays a single tap.
  const requestCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setConfirmDiscardOpen(true);
    } else {
      cancelEditing();
    }
  }, [hasUnsavedChanges, cancelEditing]);

  useEffect(() => {
    if (!isEditing) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      requestCancel();
      return true;
    });
    return () => sub.remove();
  }, [isEditing, requestCancel]);

  if (isLoading && !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background">
        <ActivityIndicator color="#00E5FF" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light px-6 dark:bg-background">
        <Text className="text-center font-body text-body text-error">{error ?? "Couldn't load your profile."}</Text>
      </SafeAreaView>
    );
  }

  const displayed = isEditing && draft ? draft : profile;

  return (
    // 'bottom' dropped from edges: the Tabs bar below this screen already
    // covers the bottom safe-area inset — adding it here double-pads.
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background" edges={['top']}>
      <View className="px-6 pt-2">
        <Text className="text-center font-display text-h3 text-primary-light dark:text-primary">{t('nav.profile')}</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-section px-6 pt-4"
        contentContainerStyle={{ paddingBottom: tabBarHeight + insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {error && <Text className="font-body text-small text-error">{error}</Text>}

        <ProfileHeaderSection
          profile={profile}
          draft={draft}
          isEditing={isEditing}
          isUploadingAvatar={isUploading}
          onAvatarPress={pickAvatar}
          onNameChange={(full_name) => patchDraft({ full_name })}
          onToggleEdit={isEditing ? requestCancel : startEditing}
        />

        <PhysicalStatsSection profile={displayed} isEditing={isEditing} onChange={patchDraft} />
        <FitnessInfoSection profile={displayed} isEditing={isEditing} onChange={patchDraft} />
        <AITrainerSettingsSection profile={displayed} isEditing={isEditing} onChange={patchDraft} />
        <WorkoutHistorySection stats={stats} />
        <AccountSection
          email={email}
          isChangingPassword={isChangingPassword}
          onChangePassword={changePassword}
          isClearingChatHistory={isClearingChatHistory}
          onClearChatHistory={clearChatHistory}
          isLoggingOut={isLoggingOut}
          onLogout={logout}
          isDeleting={isDeleting}
          onDeleteAccount={deleteAccount}
        />
      </ScrollView>

      {isEditing && (
        <View
          className="flex-row gap-3 border-t border-border-light bg-background-light px-6 pt-4 dark:border-border dark:bg-background"
          style={{ paddingBottom: tabBarHeight + insets.bottom + 16 }}
        >
          <View className="flex-1">
            <Button label={t('common.cancel')} variant="secondary" onPress={requestCancel} />
          </View>
          <View className="flex-1">
            <Button label={t('common.saveChanges')} loading={isSaving} onPress={save} />
          </View>
        </View>
      )}

      <ConfirmModal
        visible={confirmDiscardOpen}
        title={t('common.discardChangesTitle')}
        message={t('common.discardChangesMessage')}
        confirmLabel={t('common.discard')}
        destructive
        onConfirm={() => {
          setConfirmDiscardOpen(false);
          cancelEditing();
        }}
        onCancel={() => setConfirmDiscardOpen(false)}
      />

      <Toast message={successMessage} onHide={clearSuccess} />
    </SafeAreaView>
  );
}
