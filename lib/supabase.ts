import { auth } from './local/auth';
import { from } from './local/db';

// OFFLINE BUILD: this file replaces the real Supabase client. It exposes the
// slice of the supabase-js API the app uses (auth, from(), functions.invoke),
// backed by an on-device database in ./local/ instead of the network. Every
// hook and screen keeps importing `supabase` from here unchanged.
export const supabase = {
  auth,
  from,
  functions: {
    // The only Edge Function the app invokes through supabase-js; `chat` and
    // `live-review-feedback` are replaced by lib/gemini.ts / lib/liveReviewCoach.ts.
    async invoke(name: string, _options?: unknown) {
      if (name === 'delete-account') {
        const { error } = await auth.deleteCurrentUser();
        return { data: null, error };
      }
      return { data: null, error: { message: `Edge function "${name}" is not available offline` } };
    },
  },
};
