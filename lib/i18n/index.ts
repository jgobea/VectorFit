import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import es from './locales/es';

// Started synchronously at module-eval time (imported once from
// stores/localeStore.ts, which is itself imported in app/_layout.tsx) so
// every screen has translations ready before first render — no loading
// state to gate on, unlike i18next's usual async backend setup.
i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export { i18next };
export default i18next;
