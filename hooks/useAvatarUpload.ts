import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';

async function uploadAvatar(userId: string, asset: ImagePicker.ImagePickerAsset): Promise<string> {
  const mimeType = asset.mimeType ?? 'image/jpeg';
  const extension = mimeType.split('/')[1] ?? 'jpg';
  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const response = await fetch(asset.uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType: mimeType, upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

// DESIGN_SPEC.md §E.1/Interactions: "Tap profile picture to upload new photo
// (camera or photo library)". Saves immediately on pick — it's a standalone
// action, not part of the edit-fields draft/save flow.
export function useAvatarUpload(userId: string | undefined) {
  const { t } = useTranslation();
  const setProfile = useUserStore((s) => s.setProfile);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAvatar = useCallback(async () => {
    if (!userId) return null;

    const source = await new Promise<'camera' | 'library' | null>((resolve) => {
      Alert.alert(t('profile.header.changePicture'), undefined, [
        { text: t('profile.header.takePhoto'), onPress: () => resolve('camera') },
        { text: t('profile.header.chooseFromLibrary'), onPress: () => resolve('library') },
        { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(null) },
      ]);
    });
    if (!source) return null;

    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permission denied, enable photo access in Settings to change your picture.');
      return null;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            allowsEditing: true,
            aspect: [1, 1],
          });
    if (result.canceled || !result.assets[0]) return null;

    setIsUploading(true);
    setError(null);
    try {
      const avatarUrl = await uploadAvatar(userId, result.assets[0]);
      const { data, error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId)
        .select()
        .single();
      if (updateError) throw updateError;
      setProfile(data);
      return avatarUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.header.uploadFailed'));
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [userId, setProfile, t]);

  return { pickAvatar, isUploading, error };
}
