'use client';

/* Price History (plan §33): searchable tracked list with sparklines; selection
   loads the full annotated chart + timeline table. */
import * as React from 'react';
import Link from 'next/link';
import { History, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Sparkline } from '@/components/ui/score-bar';
import { PriceChart } from '@/components/shared/price-chart';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Money } from '@/components/ui/atoms';
import { EstimateTag } from '@/components/ui/badges';
import { formatDate, formatMoney } from '@/lib/utils/format';
import { cn } from '@/lib/easyui/utils';
import { useI18n } from '@/lib/i18n/context';

export interface TrackedItem {
  id: string;
  title: string;
  category_label: string;
  current_price: number;
  reference_value: number | null;
  first_seen: string;
  points: Array<{ date: string; price: number }>;
}

export function PriceHistoryView({ items }: { items: TrackedItem[] }) {
  const [query, setQuery] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(items[0]?.id ?? null);
  const { t } = useI18n();

  const filtered = React.useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(q) || i.category_label.toLowerCase().includes(q));
  }, [items, query]);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  const timelineColumns: Column<{ id: string; date: string; price: number }>[] = [
    { key: 'date', header: t('ph.date'), cell: (r) => formatDate(r.date) },
    {
      key: 'event',
      header: 'Event',
      cell: (r) => {
        const idx = selected?.points.findIndex((p) => p.date === r.date) ?? -1;
        const prev = idx > 0 ? selected?.points[idx - 1]?.price : undefined;
        const event =
          prev != null && r.price < prev ? t('ph.reduced') : prev != null && r.price > prev ? t('ph.increased') : t('ph.observed');
        return <span className="text-[var(--text-secondary)]">{event}</span>;
      },
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      cell: (r) => <Money value={r.price} className="text-[var(--text-primary)]" />,
    },
    {
      key: 'source',
      header: t('ph.source'),
      align: 'right',
      cell: () => <span className="text-[var(--text-muted)]">{t('ph.sampleObservation')}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Price History</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Every price observation ORBIT has recorded for tracked items. Select an item to see its full history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Tracked list */}
        <Card className="h-fit">
          <div className="relative border-b border-[var(--border-subtle)] p-3">
            <Search className="pointer-events-none absolute left-6 top-1/2 size-4 -translate-y-[calc(50%+6px)] text-[var(--text-subtle)]" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('ph.searchTracked')}
              aria-label={t('ph.searchTracked')}
              className="focus-ring h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-[13px] placeholder:text-[var(--text-subtle)]"
            />
          </div>
          <ul className="max-h-[28rem] divide-y divide-[var(--border-subtle)] overflow-y-auto" role="list">
            {filtered.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(i.id)}
                  aria-current={selectedId === i.id}
                  className={cn(
                    'focus-ring flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-subtle)]',
                    selectedId === i.id && 'bg-[color:var(--color-brand-subtle)]'
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-[var(--text-primary)]">{i.title}</span>
                    <span className="tnum block text-[11px] text-[var(--text-muted)]">
                      {i.category_label} · {formatMoney(i.current_price)}
                    </span>
                  </span>
                  <Sparkline points={i.points.map((p) => p.price).slice(-7)} width={56} height={28} />
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="p-4">
                <EmptyState icon={History} title={t('ph.noTracked')} description={t('ph.noTrackedHint')} />
              </li>
            )}
          </ul>
        </Card>

        {/* Selected item */}
        {selected ? (
          <div className="min-w-0 space-y-5">
            <Card>
              <CardHeader>
                <div className="min-w-0">
                  <CardTitle className="truncate">{selected.title}</CardTitle>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    {selected.category_label} · {t('ph.trackedSince', { date: formatDate(selected.first_seen) })}
                    {selected.reference_value != null && (
                      <>
                        <span aria-hidden>·</span> {t('ph.reference')} {formatMoney(selected.reference_value, { compact: true })}
                        <EstimateTag />
                      </>
                    )}
                  </p>
                </div>
                <Link
                  href={`/app/opportunities?id=${selected.id}`}
                  className="focus-ring shrink-0 rounded text-xs font-medium text-[color:var(--color-brand)] hover:underline"
                >
                  Open record →
                </Link>
              </CardHeader>
              <CardContent>
                <PriceChart
                  points={selected.points}
                  referenceValue={selected.reference_value}
                  height={260}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('ph.timeline')}</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  ariaLabel="Observation timeline"
                  columns={timelineColumns}
                  rows={[...selected.points].reverse().map((p, i) => ({ id: `${p.date}-${i}`, date: p.date, price: p.price }))}
                  minWidth="36rem"
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <EmptyState icon={History} title={t('ph.selectItem')} description={t('ph.selectItemHint')} />
        )}
      </div>
    </div>
  );
}
