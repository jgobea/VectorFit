import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import type { UserProfile } from '@/types/user';

interface ProfileHeaderSectionProps {
  profile: UserProfile | null;
  draft: UserProfile | null;
  isEditing: boolean;
  isUploadingAvatar: boolean;
  onAvatarPress: () => void;
  onNameChange: (name: string) => void;
  onToggleEdit: () => void;
}

const MONTH_LABELS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Hand-rolled instead of toLocaleDateString(undefined, { month: 'long' }) —
// Hermes's Intl support is incomplete for some device locales and was
// silently dropping the month name. See UpcomingRoutineDayRow.tsx.
function memberSince(createdAt: string | undefined): string {
  if (!createdAt) return '';
  const date = new Date(createdAt);
  return `${MONTH_LABELS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

// DESIGN_SPEC.md §E.1: avatar (tap to change), editable name, member-since
// date, edit-profile pencil. The pencil toggles page-wide edit mode — the
// rest of the editable sections read `isEditing` from the same source.
export function ProfileHeaderSection({
  profile,
  draft,
  isEditing,
  isUploadingAvatar,
  onAvatarPress,
  onNameChange,
  onToggleEdit,
}: ProfileHeaderSectionProps) {
  const displayed = isEditing ? draft : profile;

  return (
    <View className="items-center gap-3 pt-2">
      <Pressable
        onPress={onAvatarPress}
        accessibilityRole="button"
        accessibilityLabel="Change profile picture"
        className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-vivid active:opacity-80"
      >
        {isUploadingAvatar ? (
          <ActivityIndicator color="#00E5FF" />
        ) : profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Feather name="user" size={40} color="#00E5FF" />
        )}
        <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full bg-cyan-vivid">
          <Feather name="camera" size={14} color="#1C1C1E" />
        </View>
      </Pressable>

      <View className="w-full flex-row items-center justify-center gap-2">
        {isEditing ? (
          <TextInput
            value={displayed?.full_name ?? ''}
            onChangeText={onNameChange}
            placeholder="Your name"
            placeholderTextColor="#A0A0A8"
            style={{ textAlignVertical: 'center' }}
            className="max-w-[220px] rounded-lg border border-cyan-vivid px-3 py-1 text-center font-display text-h3 text-primary-light dark:text-primary"
          />
        ) : (
          <Text className="font-display text-h3 text-primary-light dark:text-primary" numberOfLines={1}>
            {displayed?.full_name ?? 'Add your name'}
          </Text>
        )}
        <Pressable
          onPress={onToggleEdit}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? 'Cancel editing' : 'Edit profile'}
        >
          <Feather name={isEditing ? 'x' : 'edit-2'} size={18} color="#00E5FF" />
        </Pressable>
      </View>

      <Text className="font-body text-small text-secondary-light dark:text-secondary">
        Member since {memberSince(profile?.created_at)}
      </Text>
    </View>
  );
}
