import { useTranslation } from 'react-i18next';

export const useTranslationEnhanced = () => {
  const { t, i18n } = useTranslation();

  const translateMenu = (label: string): string => {
    if (typeof label === 'string' && label.startsWith('nav.')) {
      return t(label);
    }
    return label;
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return {
    t,
    i18n,
    translateMenu,
    changeLanguage,
    currentLanguage: i18n.language,
  };
};
