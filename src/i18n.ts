import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import zh from './i18n/zh.json';
import en from './i18n/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'zh',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
  });

export default i18n;
