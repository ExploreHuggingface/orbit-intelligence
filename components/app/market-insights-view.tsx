'use client';

/* Market Insights (plan §32): range selector updating all series. */
import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveAreaChart, type AreaChartData } from '@/components/easyui/InteractiveAreaChart';
import { DonutChart, type DonutDatum } from '@/components/easyui/DonutChart';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Money, PriceDelta } from '@/components/ui/atoms';
import { ScoreBar } from '@/components/ui/score-bar';
import type { Category } from '@/lib/types';
import type { TopMover } from '@/lib/data/analytics';
import { formatMoney, formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/easyui/utils';
import { useI18n } from '@/lib/i18n/context';

const RANGES = [
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
  { days: 180, label: '180d' },
];

export interface TrendCard {
  category: Category;
  label: string;
  avg_price: number;
  change_pct: number;
  volume: number;
  avg_deal_score: number;
}

export function MarketInsightsView({
  rangeDays,
  trendCards,
  avgPriceSeries,
  distribution,
  topMovers,
}: {
  rangeDays: number;
  trendCards: TrendCard[];
  avgPriceSeries: Array<{ category: Category; label: string; points: Array<{ date: string; value: number }> }>;
  distribution: DonutDatum[];
  topMovers: TopMover[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  // Build multi-series area chart data keyed by category label.
  const areaData: AreaChartData = {};
  for (const s of avgPriceSeries) {
    areaData[s.label] = s.points.map((p) => ({ date: new Date(p.date + 'T00:00:00Z').getTime(), value: p.value }));
  }

  const moverColumns: Column<TopMover & { id: string }>[] = [
    {
      key: 'item',
      header: t('mi.opportunity'),
      cell: (m) => (
        <Link href={`/app/opportunities?id=${m.id}`} className="focus-ring block max-w-72 truncate rounded font-medium hover:underline">
          {m.title}
        </Link>
      ),
    },
    {
      key: 'was',
      header: t('mi.was'),
      align: 'right',
      cell: (m) => <span className="tnum text-[var(--text-muted)] line-through">{formatMoney(m.previous_price)}</span>,
    },
    {
      key: 'now',
      header: t('mi.now'),
      align: 'right',
      cell: (m) => <Money value={m.current_price} />,
    },
    {
      key: 'change',
      header: t('mi.change'),
      align: 'right',
      cell: (m) => <PriceDelta pct={m.price_change_pct} />,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Market Insights</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Category trends, price movement and volume across everything ORBIT tracks for you.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-0.5" role="group" aria-label="Range">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('range', String(r.days));
                router.push(`/app/market-insights?${params.toString()}`, { scroll: false });
              }}
              aria-pressed={rangeDays === r.days}
              className={cn(
                'focus-ring tnum rounded-md px-2.5 py-1 text-xs font-medium',
                rangeDays === r.days ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trend cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {trendCards.map((c) => (
          <Link
            key={c.category}
            href={`/app/discover?category=${c.category}`}
            className="focus-ring block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-shadow hover:shadow-[var(--shadow-sm)]"
          >
            <p className="text-[13px] font-medium text-[var(--text-primary)]">{c.label}</p>
            <p className="tnum mt-1 text-xl font-semibold tracking-[-0.02em]">{formatMoney(c.avg_price, { compact: true })}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px]">
              {c.change_pct <= 0 ? (
                <TrendingDown className="size-3 text-[color:var(--color-positive)]" aria-hidden />
              ) : (
                <TrendingUp className="size-3 text-[color:var(--color-negative)]" aria-hidden />
              )}
              <span className={cn('tnum', c.change_pct <= 0 ? 'text-[color:var(--color-positive)]' : 'text-[color:var(--color-negative)]')}>
                {Math.abs(c.change_pct).toFixed(1)}% avg drop rate
              </span>
            </p>
            <div className="mt-2 flex items-center justify-between border-t border-[var(--border-subtle)] pt-2">
              <span className="tnum text-[11px] text-[var(--text-muted)]">{formatNumber(c.volume)} tracked</span>
              <ScoreBar score={c.avg_deal_score} />
            </div>
            <span className="sr-only">View {c.label} opportunities</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{t('mi.avgPriceByCategory')}</CardTitle>
              <p className="text-xs text-[var(--text-muted)]">{t('mi.illustrative', { range: rangeDays })}</p>
            </div>
          </CardHeader>
          <CardContent>
            <InteractiveAreaChart data={areaData} height={280} title="Average price" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{t('mi.volumeByCategory')}</CardTitle>
              <p className="text-xs text-[var(--text-muted)]">{t('mi.volumeSubtitle')}</p>
            </div>
          </CardHeader>
          <CardContent className="grid place-items-center">
            <DonutChart data={distribution} variant="donut" size={220} centerLabel={t('mi.tracked')} showLegend />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t('mi.topMovers')}</CardTitle>
            <p className="text-xs text-[var(--text-muted)]">{t('mi.topMoversSub')}</p>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable ariaLabel={t('mi.topMovers')} columns={moverColumns} rows={topMovers} minWidth="40rem" />
        </CardContent>
      </Card>
    </div>
  );
}
