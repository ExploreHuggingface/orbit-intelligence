/* i18n configuration: supported locales, detection order, cookie name. */
export const LOCALES = ['en', 'uk', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'orbit_locale';

export const LOCALE_META: Record<Locale, { label: string; flag: string; htmlLang: string }> = {
  en: { label: 'English', flag: 'EN', htmlLang: 'en' },
  uk: { label: 'Українська', flag: 'UA', htmlLang: 'uk' },
  ru: { label: 'Русский', flag: 'RU', htmlLang: 'ru' },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && (LOCALES as readonly string[]).includes(value));
}

/** GeoIP country → default locale (used by middleware on Vercel). */
export function localeForCountry(country: string | null): Locale {
  switch (country) {
    case 'UA':
      return 'uk';
    case 'RU':
    case 'BY':
    case 'KZ':
    case 'KG':
      return 'ru';
    default:
      return 'en';
  }
}
