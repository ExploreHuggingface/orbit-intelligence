'use client';

/* Discovery panel: "What are you looking for?" — a search form, not a chat (plan §25.2). */
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/easyui/Button';
import { CATEGORIES, type Category } from '@/lib/types';
import { cn } from '@/lib/easyui/utils';
import { useI18n } from '@/lib/i18n/context';

const EXAMPLES: Record<Category, string[]> = {
  real_estate: [
    'Apartment in Friedrichshain under €350k, yield above 5.5%',
    'Rented 2-room condo Prenzlauer Berg below market',
    'Probate sale Altbau Neukölln under €200k',
  ],
  watches: ['Omega Seamaster below €4,000 with box and papers', 'Tudor Black Bay 58 under reference', 'Heuer Carrera from the 1960s'],
  cars_parts: ['Porsche 997 OEM headlight, new old stock', 'BMW E46 M3 CSL wheels', 'Air-cooled 911 Sport muffler'],
  electronics: ['ThinkPad X1 Carbon Grade A under €700', 'MacBook Air M2 open box', 'Sony A7 III with low shutter count'],
  home_living: ['Eames lounge chair original vitra', 'USM Haller sideboard pearl grey', 'Wegner CH24 wishbone chair pair'],
};

export function DiscoveryPanel({ recentQueries }: { recentQueries: string[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<Category | 'all'>('all');
  const { t } = useI18n();

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category !== 'all') params.set('category', category);
    router.push(`/app/discover?${params.toString()}`);
  };

  const fill = (text: string) => {
    setQuery(text);
  };

  return (
    <section aria-labelledby="discovery-heading" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 id="discovery-heading" className="text-base font-semibold text-[var(--text-primary)]">
        {t('overview.searchHeading')}
      </h2>
      <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">
        {t('overview.searchHint')}
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3" role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-[var(--text-subtle)]" strokeWidth={1.75} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('overview.searchPlaceholder')}
            aria-label="Search opportunities"
            className="focus-ring h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--color-surface-subtle)] pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary,var(--text-subtle))]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Category">
          {(['all', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                'focus-ring h-7 rounded-full border px-3 text-xs font-medium transition-colors',
                category === c
                  ? 'border-transparent bg-[var(--accent)] text-white'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
              )}
            >
              {t(`category.${c}` as never)}
            </button>
          ))}
        </div>
        <Button type="submit" size="md" rightIcon={<ArrowRight className="size-4" />} fullWidth>
          {t('overview.discoverCta')}
        </Button>
      </form>

      {recentQueries.length > 0 && (
        <div className="mt-4 border-t border-[var(--border-subtle)] pt-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">{t('overview.recentSearches')}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {recentQueries.slice(0, 4).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => fill(q)}
                className="focus-ring rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-[var(--border-subtle)] pt-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">
          {t('overview.exampleQueries')} — {t(`category.${category === 'all' ? 'real_estate' : category}` as never)}
        </p>
        <ul className="mt-1.5 space-y-1">
          {EXAMPLES[category === 'all' ? 'real_estate' : category].map((ex) => (
            <li key={ex}>
              <button
                type="button"
                onClick={() => fill(ex)}
                className="focus-ring w-full rounded-md px-2 py-1.5 text-left text-[13px] text-[var(--text-secondary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--text-primary)]"
              >
                “{ex}”
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
