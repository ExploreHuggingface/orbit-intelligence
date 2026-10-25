'use client';

/* Client-side i18n: the root layout provides the resolved locale + dictionary;
   client components consume it through useI18n(). */
import * as React from 'react';
import { DEFAULT_LOCALE, type Locale } from './config';
import { en, type Dictionary, type DictionaryKey } from './dictionaries/en';

export type ClientTranslator = (key: DictionaryKey, params?: Record<string, string | number>) => string;

interface I18nContextValue {
  locale: Locale;
  t: ClientTranslator;
}

const I18nContext = React.createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  t: (key, params) => {
    let text: string = en[key] ?? String(key);
    if (params) for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v));
    return text;
  },
});

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = React.useMemo<I18nContextValue>(
    () => ({
      locale,
      t: (key, params) => {
        let text: string = dictionary[key] ?? en[key] ?? String(key);
        if (params) for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v));
        return text;
      },
    }),
    [locale, dictionary]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return React.useContext(I18nContext);
}
