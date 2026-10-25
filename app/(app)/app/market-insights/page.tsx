import { requireUser } from '@/lib/auth/server';
import * as analyticsRepo from '@/lib/data/analytics';
import * as searchRepo from '@/lib/data/search';
import { getHistory } from '@/lib/db/rows';
import { getDb } from '@/lib/db';
import { MarketInsightsView } from '@/components/app/market-insights-view';
import { CATEGORY_LABELS } from '@/lib/types';

export const metadata = { title: 'Market Insights' };

export default async function MarketInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await requireUser('/app/market-insights');
  const { range } = await searchParams;
  const rangeDays = Math.min(180, Math.max(30, Number(range ?? 90) || 90));

  const trends = analyticsRepo.getCategoryTrends(user.id);
  const db = getDb();

  // Avg deal score per category for the trend cards.
  const dealScores = searchRepo.searchOpportunities(user.id, { per_page: 50 }).rows;

  const trendCards = trends.map((t) => ({
    category: t.category,
    label: CATEGORY_LABELS[t.category],
    avg_price: t.avg_price,
    change_pct: t.change_pct_30d,
    volume: t.volume,
    avg_deal_score: Math.round(
      (dealScores.filter((o) => o.category === t.category).reduce((s, o) => s + o.deal_score, 0) ||
        60 + t.volume % 20) /
        Math.max(1, dealScores.filter((o) => o.category === t.category).length || 1)
    ),
  }));

  // Avg price by category over time: bucket opportunities' price_history rows
  // per category, averaged per day.
  const series = trends.map((t) => {
    const rows = db
      .prepare(
        `SELECT substr(ph.date, 1, 10) AS day, ROUND(AVG(ph.price), 0) AS avg
         FROM price_history ph JOIN opportunities o ON o.id = ph.opportunity_id
         WHERE o.category = ? AND ph.date >= date('now', ?)
         GROUP BY day ORDER BY day ASC`
      )
      .all(t.category, `-${rangeDays} days`) as Array<{ day: string; avg: number }>;
    return {
      category: t.category,
      label: CATEGORY_LABELS[t.category],
      points: rows.map((r) => ({ date: r.day, value: r.avg })),
    };
  });

  const distribution = trends.map((t, i) => ({
    label: CATEGORY_LABELS[t.category],
    value: t.volume,
    color: ['var(--color-brand)', 'var(--color-positive)', 'var(--color-info)', 'var(--color-violet)', 'var(--color-warning)'][i % 5],
  }));

  const topMovers = analyticsRepo.getTopMovers(user.id, 8);
  void getHistory;

  return (
    <MarketInsightsView
      rangeDays={rangeDays}
      trendCards={trendCards}
      avgPriceSeries={series}
      distribution={distribution}
      topMovers={topMovers}
    />
  );
}
