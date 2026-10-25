/* Locale resolution + dictionary access. */
import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from './config';
import { en, type Dictionary, type DictionaryKey } from './dictionaries/en';
import { uk } from './dictionaries/uk';
import { ru } from './dictionaries/ru';

const DICTIONARIES: Record<Locale, Dictionary> = { en, uk, ru };

export type Translator = (key: DictionaryKey, params?: Record<string, string | number>) => string;

export function getTranslator(locale: Locale): Translator {
  const dict = DICTIONARIES[locale] ?? en;
  return (key, params) => {
    let text: string = dict[key] ?? en[key] ?? String(key);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replaceAll(`{${k}}`, String(v));
      }
    }
    return text;
  };
}

/** Server-side locale: explicit cookie first, then GeoIP country header. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const fromCookie = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const headerStore = await headers();
  const country = headerStore.get('x-vercel-ip-country');
  if (country === 'UA') return 'uk';
  if (country === 'RU' || country === 'BY' || country === 'KZ' || country === 'KG') return 'ru';
  return DEFAULT_LOCALE;
}

export async function getI18n(): Promise<{ locale: Locale; t: Translator }> {
  const locale = await getLocale();
  return { locale, t: getTranslator(locale) };
}

export { DICTIONARIES };
export type { Dictionary, DictionaryKey };
