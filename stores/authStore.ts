import type { LocalSession } from '@/lib/local/auth';
import { create } from 'zustand';

interface AuthState {
  session: LocalSession | null;
  user: LocalSession['user'] | null;
  isInitializing: boolean;
  setSession: (session: LocalSession | null) => void;
  setInitializing: (isInitializing: boolean) => void;
}

// Session state only — supabase.auth is the source of truth. app/_layout.tsx
// subscribes to supabase.auth.onAuthStateChange and mirrors it in here so
// route guards can read session synchronously.
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitializing: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setInitializing: (isInitializing) => set({ isInitializing }),
}));
