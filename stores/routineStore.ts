import { create } from 'zustand';

import type { Routine, RoutineDay, RoutineExercise } from '@/types/routine';

interface RoutineState {
  routine: Routine | null;
  isLoading: boolean;
  error: string | null;
  setRoutine: (routine: Routine | null) => void;
  patchDay: (dayId: string, patch: Partial<RoutineDay>) => void;
  setDayExercises: (dayId: string, exercises: RoutineExercise[]) => void;
  patchExercise: (exerciseId: string, patch: Partial<RoutineExercise>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Single source of truth for the user's one routine — both the Dashboard
// (read-only preview) and the routine builder (full CRUD) read from and
// write to this store, so edits made in the builder show up on the
// Dashboard immediately on navigating back, no refetch required.
export const useRoutineStore = create<RoutineState>((set) => ({
  routine: null,
  isLoading: true,
  error: null,
  setRoutine: (routine) => set({ routine }),
  patchDay: (dayId, patch) =>
    set((state) => {
      if (!state.routine) return state;
      return {
        routine: {
          ...state.routine,
          days: state.routine.days.map((d) => (d.id === dayId ? { ...d, ...patch } : d)),
        },
      };
    }),
  setDayExercises: (dayId, exercises) =>
    set((state) => {
      if (!state.routine) return state;
      return {
        routine: {
          ...state.routine,
          days: state.routine.days.map((d) => (d.id === dayId ? { ...d, exercises } : d)),
        },
      };
    }),
  patchExercise: (exerciseId, patch) =>
    set((state) => {
      if (!state.routine) return state;
      return {
        routine: {
          ...state.routine,
          days: state.routine.days.map((d) => ({
            ...d,
            exercises: d.exercises.map((e) => (e.id === exerciseId ? { ...e, ...patch } : e)),
          })),
        },
      };
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
