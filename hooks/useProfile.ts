import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import type { UserProfile } from '@/types/user';

// Owns loading the profile row plus an edit-mode draft (view vs. edit
// states per DESIGN_SPEC.md §E) and saving it back. Avatar upload is a
// separate, immediate action — see hooks/useAvatarUpload.ts.
export function useProfile() {
  const userId = useAuthStore((s) => s.user?.id);
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const { data, error: loadError } = await supabase.from('users').select('*').eq('id', userId).single();
    if (loadError) {
      setError(loadError.message);
    } else {
      setError(null);
      setProfile(data);
    }
    setIsLoading(false);
  }, [userId, setProfile]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const startEditing = useCallback(() => {
    if (!profile) return;
    setDraft({ ...profile });
    setIsEditing(true);
  }, [profile]);

  const cancelEditing = useCallback(() => {
    setDraft(null);
    setIsEditing(false);
  }, []);

  const patchDraft = useCallback((patch: Partial<UserProfile>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const save = useCallback(async () => {
    if (!userId || !draft) return;
    setIsSaving(true);

    const weightChanged = draft.weight_kg !== profile?.weight_kg;
    const {
      id: _id,
      avatar_url: _avatarUrl,
      created_at: _createdAt,
      updated_at: _updatedAt,
      ...editableFields
    } = draft;

    const { data, error: saveError } = await supabase
      .from('users')
      .update({
        ...editableFields,
        weight_updated_at: weightChanged ? new Date().toISOString() : draft.weight_updated_at,
      })
      .eq('id', userId)
      .select()
      .single();

    setIsSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setProfile(data);
    setDraft(null);
    setIsEditing(false);
    setSuccessMessage('Profile updated');
  }, [userId, draft, profile, setProfile]);

  return {
    profile,
    draft,
    isLoading,
    isSaving,
    isEditing,
    error,
    successMessage,
    clearSuccess: () => setSuccessMessage(null),
    startEditing,
    cancelEditing,
    patchDraft,
    save,
  };
}
