import { create } from 'zustand';

import type { UserProfile } from '@/types/user';

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: UserProfile | null) => void;
  /** Optimistic local patch — apply before the Supabase write resolves. */
  patchProfile: (patch: Partial<UserProfile>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  setProfile: (profile) => set({ profile }),
  patchProfile: (patch) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...patch } : state.profile,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
