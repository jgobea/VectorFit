import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { i18next } from '@/lib/i18n';

export type AppLocale = 'en' | 'es';

interface LocaleState {
  locale: AppLocale;
  hasHydrated: boolean;
  setLocale: (locale: AppLocale) => void;
}

// This is the whole app's UI language (login, nav, buttons, etc). It is
// deliberately separate from users.language_preference, which only controls
// what language the AI trainer replies in (AITrainerSettingsSection.tsx) —
// a user can read the app in Spanish while still chatting with an
// English-speaking coach, or vice versa.
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      hasHydrated: false,
      setLocale: (locale) => {
        i18next.changeLanguage(locale);
        set({ locale });
      },
    }),
    {
      name: 'vectorfit-locale',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) i18next.changeLanguage(state.locale);
        useLocaleStore.setState({ hasHydrated: true });
      },
    }
  )
);
