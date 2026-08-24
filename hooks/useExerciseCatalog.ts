import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Exercise } from '@/types/workout';

// Only pose-trackable exercises are relevant to Live Review — exercises
// without a quickpose_feature exist in the catalog for other pages (workout
// plans, etc.) but can't be selected here.
export function useExerciseCatalog() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const { data, error: fetchError } = await supabase
      .from('exercises')
      .select('*')
      .not('quickpose_feature', 'is', null)
      .order('name');

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError(null);
      setExercises(data ?? []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { exercises, isLoading, error };
}
