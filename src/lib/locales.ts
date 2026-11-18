export type Locale = 'fr' | 'en';
export const LOCALE_TAGS: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB' };
export const fmtDate = (d: Date, locale: Locale, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(LOCALE_TAGS[locale], options).format(d);
