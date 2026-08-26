import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Exercise } from '@/types/workout';

// Unlike useExerciseCatalog (Live Review, pose-trackable exercises only),
// the routine builder lets you add any exercise from the catalog — shared
// (seeded) ones plus your own custom ones, per RLS in
// supabase/migrations/20260827100000_user_custom_exercises.sql.
export function useAllExercises() {
  const userId = useAuthStore((s) => s.user?.id);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const { data, error: fetchError } = await supabase.from('exercises').select('*').order('name');

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

  // Custom exercises can never carry a quickpose_feature — RLS enforces
  // this too (exercises_insert_own_custom), this just matches it client-side.
  const createCustomExercise = useCallback(
    async (name: string, category: string | null) => {
      if (!userId) return null;
      const { data, error: insertError } = await supabase
        .from('exercises')
        .insert({ name, category, created_by: userId, quickpose_feature: null })
        .select('*')
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }
      setExercises((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    },
    [userId]
  );

  const deleteCustomExercise = useCallback(async (exerciseId: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== exerciseId));
    await supabase.from('exercises').delete().eq('id', exerciseId);
  }, []);

  return { exercises, isLoading, error, createCustomExercise, deleteCustomExercise };
}
