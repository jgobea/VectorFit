import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'dark' | 'light' | 'system';

interface UiState {
  theme: ThemePreference;
  hasHydrated: boolean;
  setTheme: (theme: ThemePreference) => void;
  /**
   * True only while an actual Live Review camera session (workout/resting/
   * summary) is on screen — not during its pre-session setup form. Lets
   * app/(app)/_layout.tsx hide the bottom tab bar for full-screen immersion
   * without ever hiding it while the setup screen still needs a way out.
   */
  isLiveReviewActive: boolean;
  setLiveReviewActive: (isLiveReviewActive: boolean) => void;
}

// NativeWind's darkMode:'class' is a manual switch by design (that's the
// difference from darkMode:'media') — colorScheme.set('system') does NOT
// follow the OS/browser preference, it just clears to light. To actually
// track the system preference we resolve it ourselves via Appearance and
// apply a concrete 'dark' | 'light' value.
function applyTheme(theme: ThemePreference) {
  const resolved = theme === 'system' ? (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light') : theme;
  colorScheme.set(resolved);
}

// Runs as soon as this module is imported (not lazily on first hook use), so
// the app must import it somewhere on boot — see app/_layout.tsx.
applyTheme('system');
Appearance.addChangeListener(() => {
  if (useUiStore.getState().theme === 'system') applyTheme('system');
});

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      hasHydrated: false,
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      isLiveReviewActive: false,
      setLiveReviewActive: (isLiveReviewActive) => set({ isLiveReviewActive }),
    }),
    {
      name: 'vectorfit-ui',
      storage: createJSONStorage(() => AsyncStorage),
      // Only theme should survive an app restart — isLiveReviewActive is
      // live session state, not a preference, and would wrongly hide the
      // tab bar forever if the app were killed mid-session.
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
        useUiStore.setState({ hasHydrated: true });
      },
    }
  )
);
