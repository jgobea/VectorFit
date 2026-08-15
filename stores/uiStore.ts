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
    }),
    {
      name: 'vectorfit-ui',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
        useUiStore.setState({ hasHydrated: true });
      },
    }
  )
);
