import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';

import { supabase } from '@/lib/supabase';

// webClientId (not an Android client ID) is what Supabase's Google provider
// validates the ID token's audience against — see
// https://supabase.com/docs/guides/auth/social-login/auth-google#configure-native-mobile-sign-in.
// Configured once at module load, same as lib/supabase.ts's client.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

// Handles both sign-up and sign-in — Supabase creates the auth.users row
// (and, via the on_auth_user_created trigger, the matching public.users
// profile row) automatically the first time a given Google account signs
// in, exactly like a brand-new email/password signup would. Returns null
// on success or on a user-initiated cancel (nothing to show for that),
// and an error message otherwise.
export async function signInWithGoogle(): Promise<string | null> {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null;

    const idToken = response.data.idToken;
    if (!idToken) return 'Google did not return an ID token.';

    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    return error?.message ?? null;
  } catch (err) {
    if (isErrorWithCode(err)) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED || err.code === statusCodes.IN_PROGRESS) return null;
      if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) return 'Google Play Services is not available on this device.';
      return err.message;
    }
    return err instanceof Error ? err.message : 'Google sign-in failed.';
  }
}
