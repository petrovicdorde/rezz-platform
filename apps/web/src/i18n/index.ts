import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import srTranslation from '../locales/sr/translation.json';
import enTranslation from '../locales/en/translation.json';

i18n
  .use(initReactI18next)
  .init({
    lng: 'sr',
    fallbackLng: 'sr',
    defaultNS: 'translation',
    resources: {
      sr: { translation: srTranslation },
      en: { translation: enTranslation },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
