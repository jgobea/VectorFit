import { create } from 'zustand';

import type { Workout, WorkoutSession } from '@/types/workout';

interface WorkoutState {
  todaysWorkouts: Workout[];
  upcomingWorkouts: Workout[];
  activeSession: WorkoutSession | null;
  isLoading: boolean;
  error: string | null;
  setTodaysWorkouts: (workouts: Workout[]) => void;
  setUpcomingWorkouts: (workouts: Workout[]) => void;
  setActiveSession: (session: WorkoutSession | null) => void;
  /** Optimistic local patch — apply before the Supabase write resolves. */
  patchActiveSession: (patch: Partial<WorkoutSession>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  todaysWorkouts: [],
  upcomingWorkouts: [],
  activeSession: null,
  isLoading: false,
  error: null,
  setTodaysWorkouts: (todaysWorkouts) => set({ todaysWorkouts }),
  setUpcomingWorkouts: (upcomingWorkouts) => set({ upcomingWorkouts }),
  setActiveSession: (activeSession) => set({ activeSession }),
  patchActiveSession: (patch) =>
    set((state) => ({
      activeSession: state.activeSession ? { ...state.activeSession, ...patch } : state.activeSession,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
