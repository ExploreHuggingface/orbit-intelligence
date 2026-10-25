'use client';

/* Language selector (EN / UA / RU): sets the locale cookie and refreshes so
   server components re-render in the new language. GeoIP sets the cookie
   automatically on first visit (middleware); this overrides it. */
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Check } from 'lucide-react';
import { LOCALES, LOCALE_COOKIE, LOCALE_META, type Locale } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/easyui/utils';

export function LanguageSelector({
  variant = 'dark',
  className,
}: {
  variant?: 'dark' | 'light';
  className?: string;
}) {
  const router = useRouter();
  const { locale } = useI18n();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setOpen(false);
    router.refresh();
  };

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Language"
        className={cn(
          'focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-medium transition-colors',
          variant === 'dark'
            ? 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            : 'border-[var(--color-line)] bg-white text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
        )}
      >
        <Globe className="size-3.5" strokeWidth={1.75} aria-hidden />
        <span className="tnum">{LOCALE_META[locale].flag}</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Language"
          className={cn(
            'absolute right-0 z-50 mt-1.5 w-40 rounded-xl border p-1 shadow-[var(--shadow-lg)]',
            variant === 'dark'
              ? 'border-[var(--border)] bg-[var(--surface)]'
              : 'border-[var(--color-line)] bg-white'
          )}
        >
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitem"
              onClick={() => choose(l)}
              className={cn(
                'focus-ring flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px]',
                l === locale
                  ? 'font-medium text-[var(--color-brand)]'
                  : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-ink)]'
              )}
            >
              {LOCALE_META[l].label}
              {l === locale && <Check className="size-3.5" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
