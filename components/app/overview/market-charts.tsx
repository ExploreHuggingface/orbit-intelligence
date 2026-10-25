'use client';

/* Market Intelligence panel (plan §25.6): discoveries area chart, price drops
   by category bars, deal score metric, market vs listing grouped bars.
   The range selector re-queries server data via URL param. */
import * as React from 'react';
import Link from 'next/link';
import { InteractiveAreaChart, type AreaChartData } from '@/components/easyui/InteractiveAreaChart';
import { BarChart, type BarDatum, type BarSeries } from '@/components/easyui/BarChart';
import { Card, CardContent, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/card';
import { ScoreBar } from '@/components/ui/score-bar';
import {
  CATEGORY_LABELS,
  type CategoryPriceDrop,
  type DealScoreDistribution,
  type DiscoveriesPoint,
  type MarketVsListing,
} from '@/lib/types';
import { formatMoney, formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/easyui/utils';

const RANGES = [
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
];

export function MarketCharts({
  rangeDays,
  discoveries,
  priceDrops,
  scoreDistribution,
  avgDealScore,
  marketVsListing,
  onRangeChange,
}: {
  rangeDays: number;
  discoveries: DiscoveriesPoint[];
  priceDrops: CategoryPriceDrop[];
  scoreDistribution: DealScoreDistribution[];
  avgDealScore: number;
  marketVsListing: MarketVsListing[];
  onRangeChange: (days: number) => void;
}) {
  const areaData: AreaChartData = {
    Discoveries: discoveries.map((d) => ({
      date: new Date(d.date + 'T00:00:00Z').getTime(),
      value: d.count,
    })),
  };

  const dropData: BarDatum[] = priceDrops.map((d) => ({
    label: CATEGORY_LABELS[d.category],
    drops: d.drops,
  }));

  const distData: BarDatum[] = scoreDistribution.map((d) => ({
    label: d.bucket,
    count: d.count,
  }));

  const mvSeries: BarSeries[] = [
    { key: 'listing', label: 'Avg listing', color: 'var(--color-brand)' },
    { key: 'market', label: 'Avg reference', color: 'var(--color-info)' },
  ];
  const mvData: BarDatum[] = marketVsListing.map((m) => ({
    label: CATEGORY_LABELS[m.category],
    listing: m.avg_listing,
    market: m.avg_market,
  }));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Market Intelligence</CardTitle>
          <CardSubtitle>Computed from tracked opportunities in your workspace</CardSubtitle>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-0.5" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => onRangeChange(r.days)}
              aria-pressed={rangeDays === r.days}
              className={cn(
                'focus-ring tnum rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                rangeDays === r.days
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Discoveries over time</p>
          <InteractiveAreaChart data={areaData} height={200} title="Discoveries" />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Price drops by category</p>
          {dropData.length > 0 ? (
            <BarChart
              data={dropData}
              series={[{ key: 'drops', label: 'Price drops', color: 'var(--color-warning)' }]}
              variant="grouped"
              height={200}
              formatValue={(n) => `${formatNumber(n)} drops`}
              formatTick={(n) => String(n)}
              ariaLabel="Price drops by category"
            />
          ) : (
            <p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-xs text-[var(--text-muted)]">
              No price drops in this range.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Deal score distribution</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="shrink-0 text-center">
              <p className="tnum text-3xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{avgDealScore}</p>
              <p className="text-[11px] text-[var(--text-muted)]">avg deal score</p>
              <ScoreBar score={avgDealScore} className="mt-1.5 justify-center" />
            </div>
            <div className="min-w-0 flex-1">
              {distData.length > 0 && (
                <BarChart
                  data={distData}
                  series={[{ key: 'count', label: 'Opportunities', color: 'var(--color-brand)' }]}
                  variant="grouped"
                  height={150}
                  formatValue={(n) => `${n} opportunities`}
                  formatTick={(n) => String(n)}
                  ariaLabel="Deal score distribution"
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            Market vs listing price
            <span className="ml-1.5 font-normal text-[var(--text-subtle)]">· illustrative estimates</span>
          </p>
          <BarChart
            data={mvData}
            series={mvSeries}
            variant="grouped"
            height={200}
            formatValue={(n) => formatMoney(n, { compact: true })}
            formatTick={(n) => formatMoney(n, { compact: true })}
            showLegend
            ariaLabel="Average listing price versus estimated market value by category"
          />
        </div>
      </CardContent>
      <div className="border-t border-[var(--border-subtle)] px-5 py-2.5">
        <Link href="/app/market-insights" className="text-xs font-medium text-[color:var(--color-brand)] hover:underline">
          Open Market Insights →
        </Link>
      </div>
    </Card>
  );
}
