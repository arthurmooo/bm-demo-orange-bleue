/** Démo en français uniquement : même interface que l'i18n du design system. */
export type Lang = 'fr' | 'en';
export type { Locale } from './locales';
const ctx = {
  lang: 'fr' as Lang,
  locale: 'fr' as const,
  shown: 'fr' as const,
  setLang: () => {},
  toggle: () => {},
  L: (fr: string, _en?: string) => fr,
  T: (b: { fr: string; en: string }) => b.fr,
};
export const useLang = () => ctx;
