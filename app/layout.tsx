import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import { Toaster } from 'sonner';
import { I18nProvider } from '@/lib/i18n/context';
import { LOCALE_META } from '@/lib/i18n/config';
import { getLocale } from '@/lib/i18n/server';
import { DICTIONARIES } from '@/lib/i18n/server';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ORBIT Intelligence — Your next opportunity is out there',
    template: '%s · ORBIT Intelligence',
  },
  description:
    'ORBIT continuously scans marketplaces and the web, scores what matches your criteria, and alerts you before the market does.',
};

export const viewport: Viewport = {
  themeColor: '#F6F7F9',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={LOCALE_META[locale].htmlLang}>
      <body className="antialiased">
        <I18nProvider locale={locale} dictionary={DICTIONARIES[locale]}>
          {children}
          <Toaster position="bottom-right" richColors />
        </I18nProvider>
      </body>
    </html>
  );
}
