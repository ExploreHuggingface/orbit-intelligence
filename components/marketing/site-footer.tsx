'use client';

/* Marketing footer (plan §16): 4 columns + bottom bar, no fake social links. */
import Link from 'next/link';
import { OrbitMark } from '@/components/ui/logo';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSelector } from '@/components/ui/language-selector';

const FOOTER_KEYS: Record<string, never> = {
  Features: 'm.footer.features',
  Pricing: 'm.header.pricing',
  Changelog: 'm.footer.changelog',
  Roadmap: 'm.footer.roadmap',
  'Real Estate': 'm.header.realEstate',
  'Watches & Collectors': 'm.footer.watchesCollectors',
  'Cars & Parts': 'm.footer.carsParts',
  About: 'm.header.about',
  Blog: 'm.header.blog',
  Contact: 'm.footer.contact',
  Careers: 'm.footer.careers',
  Privacy: 'm.footer.privacy',
  Terms: 'm.footer.terms',
} as unknown as Record<string, never>;

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string; external?: boolean }> }> = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/blog?tag=product' },
      { label: 'Roadmap', href: '/contact?topic=sales' },
    ],
  },
  {
    title: 'Use Cases',
    links: [
      { label: 'Real Estate', href: '/use-cases/real-estate' },
      { label: 'Watches & Collectors', href: '/use-cases/collectors' },
      { label: 'Cars & Parts', href: '/use-cases/deal-hunting' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/contact?topic=partnership' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-[var(--color-line)] bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--color-ink-tertiary)]">
                {t(`m.footer.${{ Product: 'product', Company: 'company', Legal: 'legal' }[col.title as string] ?? 'useCases'}` as never)}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="focus-ring rounded text-[14px] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]"
                    >
                      {t(FOOTER_KEYS[link.label] ?? 'm.footer.useCases')}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-line)] pt-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <OrbitMark size={20} />
            <span className="text-[13px] text-[var(--color-ink-tertiary)]">
              {t('m.footer.copyright')}
            </span>
          </div>
          <LanguageSelector variant="light" className="mb-3 mx-auto sm:mx-0" />
          <p className="max-w-md text-center text-[12px] leading-relaxed text-[var(--color-ink-tertiary)] sm:text-right">
            {t('m.footer.cookieNote')}{' '}
            <Link href="/privacy" className="underline hover:text-[var(--color-ink-secondary)]">
              {t('m.footer.privacyPolicy')}
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
