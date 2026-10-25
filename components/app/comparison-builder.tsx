'use client';

/* Comparisons (plan §30): search-select 2–4 opportunities, table with
   best-value wash, category-aware rows. */
import * as React from 'react';
import Link from 'next/link';
import { GitCompareArrows, Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ScoreBar } from '@/components/ui/score-bar';
import { useDebouncedValue } from '@/lib/hooks';
import { formatMoney } from '@/lib/utils/format';
import type { Opportunity } from '@/lib/types';
import { cn } from '@/lib/easyui/utils';
import { useI18n } from '@/lib/i18n/context';

export function ComparisonBuilder({
  candidates,
  initialSelected,
  comparisonLimit,
}: {
  candidates: Opportunity[];
  initialSelected: Opportunity[];
  comparisonLimit: number;
}) {
  const [selected, setSelected] = React.useState<Opportunity[]>(initialSelected);
  const [query, setQuery] = React.useState('');
  const { t } = useI18n();
  const debounced = useDebouncedValue(query, 300);
  const limitReached = selected.length >= comparisonLimit;

  const matches = React.useMemo(() => {
    if (!debounced || debounced.length < 2) return [];
    const q = debounced.toLowerCase();
    return candidates.filter((c) => !selected.some((s) => s.id === c.id) && c.title.toLowerCase().includes(q)).slice(0, 6);
  }, [debounced, candidates, selected]);

  const allRealEstate = selected.length > 0 && selected.every((o) => o.real_estate != null);

  const rows: Array<{ label: string; values: Array<string | number | null>; better: 'min' | 'max' | null; render?: (v: string | number | null) => React.ReactNode }> = [
    { label: t('table.price'), values: selected.map((o) => o.current_price), better: 'min', render: (v) => (v == null ? '—' : formatMoney(Number(v))) },
    {
      label: t('table.reference'),
      values: selected.map((o) => o.estimated_market_value),
      better: null,
      render: (v) => (v == null ? '—' : formatMoney(Number(v))),
    },
    {
      label: t('comp.vsReference'),
      values: selected.map((o) =>
        o.estimated_market_value != null
          ? Math.round(((o.current_price - o.estimated_market_value) / o.estimated_market_value) * 1000) / 10
          : null
      ),
      better: 'min',
      render: (v) => (v == null ? '—' : `${Number(v) > 0 ? '+' : ''}${v}%`),
    },
    { label: t('table.dealScore'), values: selected.map((o) => o.deal_score), better: 'max', render: (v) => <ScoreBar score={Number(v ?? 0)} /> },
    { label: t('opp.matchScore'), values: selected.map((o) => o.match_score), better: 'max' },
    {
      label: t('comp.condition'),
      values: selected.map((o) => (o.attributes.condition ? String(o.attributes.condition) : null)),
      better: null,
    },
    {
      label: t('comp.sellerSource'),
      values: selected.map((o) => o.source_marketplace),
      better: null,
    },
    {
      label: t('comp.location'),
      values: selected.map((o) => (o.real_estate ? `${o.real_estate.city} — ${o.real_estate.neighborhood}` : null)),
      better: null,
    },
  ];

  if (allRealEstate) {
    rows.push(
      { label: t('comp.areaM2'), values: selected.map((o) => o.real_estate?.area_m2 ?? null), better: 'max' },
      { label: t('comp.bedrooms'), values: selected.map((o) => o.real_estate?.bedrooms ?? null), better: 'max' },
      { label: t('comp.estRent'), values: selected.map((o) => o.real_estate?.est_rent_monthly ?? null), better: 'max', render: (v) => (v == null ? '—' : formatMoney(Number(v))) },
      { label: t('comp.grossYield'), values: selected.map((o) => o.real_estate?.gross_yield_pct ?? null), better: 'max', render: (v) => (v == null ? '—' : `${v}%`) },
      { label: t('comp.pricePerM2'), values: selected.map((o) => (o.real_estate ? Math.round(o.current_price / o.real_estate.area_m2) : null)), better: 'min', render: (v) => (v == null ? '—' : formatMoney(Number(v))) }
    );
  }

  const bestIndex = (values: Array<string | number | null>, better: 'min' | 'max' | null): number => {
    if (!better) return -1;
    const nums = values.map((v) => (typeof v === 'number' ? v : null));
    if (nums.every((n) => n == null)) return -1;
    let best = -1;
    nums.forEach((n, i) => {
      if (n == null) return;
      if (best === -1) best = i;
      else if (better === 'min' ? n < nums[best]! : n > nums[best]!) best = i;
    });
    return best;
  };

  return (
    <div className="space-y-5">
      {/* Selector */}
      <Card>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('comp.searchPlaceholder')}
            aria-label={t('comp.searchPlaceholder')}
            disabled={limitReached}
            className="focus-ring h-11 w-full rounded-t-xl border-b border-[var(--border)] bg-[var(--surface)] px-4 text-sm placeholder:text-[var(--text-subtle)] disabled:opacity-50"
          />
          {matches.length > 0 && (
            <ul
              role="listbox"
              aria-label="Search results"
              className="absolute inset-x-0 top-full z-20 max-h-72 overflow-y-auto rounded-b-xl border border-t-0 border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-lg)]"
            >
              {matches.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => {
                      setSelected((s) => [...s, m]);
                      setQuery('');
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] hover:bg-[var(--surface-hover)]"
                  >
                    <span className="min-w-0 truncate text-[var(--text-primary)]">{m.title}</span>
                    <span className="tnum shrink-0 text-xs text-[var(--text-muted)]">{formatMoney(m.current_price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <CardContent className="flex flex-wrap items-center gap-2 py-3">
          {selected.map((o) => (
            <span
              key={o.id}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--color-surface-subtle)] py-1 pl-3 pr-1 text-xs font-medium text-[var(--text-primary)]"
            >
              <span className="truncate">{o.title}</span>
              <button
                type="button"
                onClick={() => setSelected((s) => s.filter((x) => x.id !== o.id))}
                aria-label={`Remove ${o.title} from comparison`}
                className="focus-ring grid size-5 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[color:var(--color-negative)]"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {selected.length === 0 && (
            <p className="text-[13px] text-[var(--text-muted)]">
              {t('comp.pickHint', { n: comparisonLimit === 2 ? '2' : '2–4' })}
            </p>
          )}
          <span className="tnum ml-auto text-xs text-[var(--text-muted)]">
            {selected.length} / {comparisonLimit} selected
          </span>
        </CardContent>
      </Card>

      {selected.length < 2 ? (
        <EmptyState
          icon={GitCompareArrows}
          title={t('comp.emptyTitle')}
          description={
            limitReached
              ? `You've reached ${selected.length}. Compare side-by-side with reference values and yields.`
              : t('comp.emptyHint')
          }
          action={
            <Link
              href="/app/discover"
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3.5 text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            >
              <Plus className="size-4" aria-hidden /> {t('comp.browse')}
            </Link>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left" aria-label={t('comp.title')}>
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className="h-11 px-4 text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--text-muted)]">
                    {t('comp.attribute')}
                  </th>
                  {selected.map((o) => (
                    <th key={o.id} scope="col" className="h-11 min-w-44 px-4 text-[13px] font-semibold text-[var(--text-primary)]">
                      <Link href={`/app/opportunities?id=${o.id}`} className="focus-ring rounded hover:underline">
                        {o.title.length > 42 ? `${o.title.slice(0, 42)}…` : o.title}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const best = bestIndex(row.values, row.better);
                  return (
                    <tr key={row.label} className="border-b border-[var(--border-subtle)] last:border-b-0">
                      <th scope="row" className="h-11 px-4 text-[13px] font-medium text-[var(--text-secondary)]">
                        {row.label}
                      </th>
                      {row.values.map((v, i) => (
                        <td
                          key={i}
                          className={cn(
                            'tnum h-11 px-4 text-[13px] text-[var(--text-primary)]',
                            i === best && 'bg-[color:var(--color-brand-subtle)] font-semibold'
                          )}
                        >
                          {row.render ? row.render(v) : v == null ? '—' : typeof v === 'number' ? v.toLocaleString('en-IE') : v}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-[var(--border-subtle)] px-4 py-3 text-[11px] text-[var(--text-muted)]">
            {t('comp.note')}
          </p>
        </Card>
      )}
    </div>
  );
}
