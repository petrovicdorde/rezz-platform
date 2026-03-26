import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import srTranslation from '../locales/sr/translation.json';
import enTranslation from '../locales/en/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'sr',
    defaultNS: 'translation',
    resources: {
      sr: { translation: srTranslation },
      en: { translation: enTranslation },
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
