import { create } from 'zustand';

import type { WorkoutSession } from '@/types/workout';

interface WorkoutState {
  activeSession: WorkoutSession | null;
  isLoading: boolean;
  error: string | null;
  setActiveSession: (session: WorkoutSession | null) => void;
  /** Optimistic local patch — apply before the Supabase write resolves. */
  patchActiveSession: (patch: Partial<WorkoutSession>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  activeSession: null,
  isLoading: false,
  error: null,
  setActiveSession: (activeSession) => set({ activeSession }),
  patchActiveSession: (patch) =>
    set((state) => ({
      activeSession: state.activeSession ? { ...state.activeSession, ...patch } : state.activeSession,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
