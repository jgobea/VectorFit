import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import type { UserProfile } from '@/types/user';

// Owns loading the profile row plus an edit-mode draft (view vs. edit
// states per DESIGN_SPEC.md §E) and saving it back. Avatar upload is a
// separate, immediate action — see hooks/useAvatarUpload.ts.
export function useProfile() {
  const { t } = useTranslation();
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

  // Every field on UserProfile is a primitive now (the last array fields —
  // preferred_workout_types/rest_days — were dropped with the Preferences
  // section), so a plain JSON diff is a reliable dirty-check without
  // needing a per-field comparison.
  const hasUnsavedChanges = draft !== null && JSON.stringify(draft) !== JSON.stringify(profile);

  const patchDraft = useCallback((patch: Partial<UserProfile>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  // Immediate single-field (or a few related fields, e.g. weight) save —
  // Profile's per-row "quick edit" modals use this instead of the
  // draft/isEditing flow above, so tapping one setting doesn't require
  // entering edit mode for the whole page first.
  const saveField = useCallback(
    async (patch: Partial<UserProfile>) => {
      if (!userId || !profile) return false;
      setIsSaving(true);

      const weightChanged = 'weight_kg' in patch && patch.weight_kg !== profile.weight_kg;

      const { data, error: saveError } = await supabase
        .from('users')
        .update({ ...patch, ...(weightChanged ? { weight_updated_at: new Date().toISOString() } : {}) })
        .eq('id', userId)
        .select()
        .single();

      setIsSaving(false);

      if (saveError) {
        setError(saveError.message);
        return false;
      }

      setProfile(data);
      setSuccessMessage(t('profile.updated'));
      return true;
    },
    [userId, profile, setProfile, t]
  );

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
    setSuccessMessage(t('profile.updated'));
  }, [userId, draft, profile, setProfile, t]);

  return {
    profile,
    draft,
    isLoading,
    isSaving,
    isEditing,
    hasUnsavedChanges,
    error,
    successMessage,
    clearSuccess: () => setSuccessMessage(null),
    startEditing,
    cancelEditing,
    patchDraft,
    save,
    saveField,
  };
}
