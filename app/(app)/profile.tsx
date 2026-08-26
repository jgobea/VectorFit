import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountSection } from '@/components/features/profile/AccountSection';
import { AITrainerSettingsSection } from '@/components/features/profile/AITrainerSettingsSection';
import { FitnessInfoSection } from '@/components/features/profile/FitnessInfoSection';
import { PhysicalStatsSection } from '@/components/features/profile/PhysicalStatsSection';
import { PreferencesSection } from '@/components/features/profile/PreferencesSection';
import { ProfileHeaderSection } from '@/components/features/profile/ProfileHeaderSection';
import { WorkoutHistorySection } from '@/components/features/profile/WorkoutHistorySection';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useAccountActions } from '@/hooks/useAccountActions';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useClearChatHistory } from '@/hooks/useClearChatHistory';
import { useProfile } from '@/hooks/useProfile';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const email = useAuthStore((s) => s.user?.email) ?? '—';

  const {
    profile,
    draft,
    isLoading,
    isSaving,
    isEditing,
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
        <Text className="text-center font-display text-h3 text-primary-light dark:text-primary">Profile</Text>
      </View>

      <ScrollView contentContainerClassName="gap-section px-6 pb-16 pt-4" showsVerticalScrollIndicator={false}>
        {error && <Text className="font-body text-small text-error">{error}</Text>}

        <ProfileHeaderSection
          profile={profile}
          draft={draft}
          isEditing={isEditing}
          isUploadingAvatar={isUploading}
          onAvatarPress={pickAvatar}
          onNameChange={(full_name) => patchDraft({ full_name })}
          onToggleEdit={isEditing ? cancelEditing : startEditing}
        />

        {isEditing && (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button label="Cancel" variant="secondary" onPress={cancelEditing} />
            </View>
            <View className="flex-1">
              <Button label="Save Changes" loading={isSaving} onPress={save} />
            </View>
          </View>
        )}

        <PhysicalStatsSection profile={displayed} isEditing={isEditing} onChange={patchDraft} />
        <FitnessInfoSection profile={displayed} isEditing={isEditing} onChange={patchDraft} />
        <PreferencesSection profile={displayed} isEditing={isEditing} onChange={patchDraft} />
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

      <Toast message={successMessage} onHide={clearSuccess} />
    </SafeAreaView>
  );
}
