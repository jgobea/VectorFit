import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

type GateStatus = 'loading' | 'needed' | 'done';

// app/(app)/_layout.tsx checks this before rendering the Tabs navigator —
// a first-time user (onboarding_completed = false) gets redirected to
// app/onboarding.tsx instead. Fails open to 'done' on error so a network
// hiccup can never trap a returning user outside the app.
export function useOnboardingGate(userId: string | undefined): GateStatus {
  const [status, setStatus] = useState<GateStatus>('loading');

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setStatus('done');
          return;
        }
        setStatus(data.onboarding_completed ? 'done' : 'needed');
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return status;
}
