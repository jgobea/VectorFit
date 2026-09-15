import * as Speech from 'expo-speech';

import { SPEECH_LANGUAGE_CODES } from '@/lib/speechLanguage';

// Short line per coach language, spoken to preview volume/voice feedback
// while the user drags the slider — never routed through i18next since it's
// spoken content tied to language_preference, not the UI locale.
const SAMPLE_PHRASES: Record<string, string> = {
  en: 'Hello! Great job, keep it up.',
  es: '¡Hola! Buen trabajo, sigue así.',
  fr: 'Bonjour ! Bon travail, continue comme ça.',
  de: 'Hallo! Gute Arbeit, weiter so.',
  pt: 'Olá! Bom trabalho, continue assim.',
};

export function playVoiceSample(languagePreference: string | null | undefined, volumePercent: number) {
  const lang = languagePreference ?? 'en';
  Speech.stop();
  Speech.speak(SAMPLE_PHRASES[lang] ?? SAMPLE_PHRASES.en, {
    language: SPEECH_LANGUAGE_CODES[lang],
    volume: volumePercent / 100,
  });
}
