import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useCallback, useState } from 'react';

import { supabase } from '@/lib/supabase';

// Google's native SDK keeps its own signed-in session on the device,
// separate from Supabase's — signing out of Supabase alone leaves it
// cached, so tapping "Continue with Google" again silently reuses the same
// account instead of showing the account picker. Best-effort: a no-op (and
// safe to call) for a user who never signed in with Google at all.
async function signOutOfGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignore — nothing to sign out of, or Play Services unavailable.
  }
}

// DESIGN_SPEC.md §E.7 Account & Logout: change password, logout, delete
// account. Logout and delete both need a confirmation modal in the UI layer
// (components/ui/ConfirmModal.tsx) — this hook only does the actual work.
export function useAccountActions() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = useCallback(async (newPassword: string) => {
    setIsChangingPassword(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setIsChangingPassword(false);
    if (updateError) {
      setError(updateError.message);
      return false;
    }
    return true;
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    await Promise.all([supabase.auth.signOut(), signOutOfGoogle()]);
    setIsLoggingOut(false);
    // app/_layout.tsx's onAuthStateChange listener clears the session store
    // and app/(app)/_layout.tsx redirects to /(auth)/login — no navigation
    // call needed here.
  }, []);

  const deleteAccount = useCallback(async () => {
    setIsDeleting(true);
    setError(null);
    const { error: fnError } = await supabase.functions.invoke('delete-account', { method: 'POST' });
    if (fnError) {
      setIsDeleting(false);
      setError(fnError.message);
      return false;
    }
    // The auth user row is gone server-side, but per Supabase's security
    // notes an existing access token isn't invalidated by deleting the
    // user — sign out explicitly to clear local session state.
    await Promise.all([supabase.auth.signOut(), signOutOfGoogle()]);
    setIsDeleting(false);
    return true;
  }, []);

  return {
    changePassword,
    isChangingPassword,
    logout,
    isLoggingOut,
    deleteAccount,
    isDeleting,
    error,
    clearError: () => setError(null),
  };
}
