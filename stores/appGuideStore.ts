import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppGuideState {
  hasSeenGuide: boolean;
  markGuideSeen: () => void;
}

// Tracks whether AppGuideModal's auto-open (dashboard.tsx, right after
// onboarding finishes) has already fired — once per device, not once per
// app session. A plain route param alone wasn't enough: navigating to
// Progress/Routine Builder (root-level routes, outside the Dashboard tab)
// and back could resurface the ?showGuide=true param and reopen it. This
// flag is the actual source of truth; the param just triggers the check.
export const useAppGuideStore = create<AppGuideState>()(
  persist(
    (set) => ({
      hasSeenGuide: false,
      markGuideSeen: () => set({ hasSeenGuide: true }),
    }),
    {
      name: 'vectorfit-app-guide',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
