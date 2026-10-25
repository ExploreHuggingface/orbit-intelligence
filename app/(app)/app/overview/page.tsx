import { Plus } from 'lucide-react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/server';
import * as searchRepo from '@/lib/data/search';
import * as monitorsRepo from '@/lib/data/monitors';
import * as collectionsRepo from '@/lib/data/collections';
import * as analyticsRepo from '@/lib/data/analytics';
import { listActivity } from '@/lib/data/activity';
import { getPlanForUser } from '@/lib/data/misc';
import { getHistory } from '@/lib/db/rows';
import { getDb } from '@/lib/db';
import { DiscoveryPanel } from '@/components/app/overview/discovery-panel';
import { KpiRow } from '@/components/app/overview/kpi-row';
import { OpportunitiesTable } from '@/components/app/opportunities-table';
import { ActiveMonitors } from '@/components/app/overview/active-monitors';
import { ActivityCard } from '@/components/app/overview/activity-feed';
import { MarketChartsSection } from '@/components/app/overview/market-charts-section';
import { ContextPanel } from '@/components/app/overview/context-panel';
import { Card, CardContent, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/card';
import { getI18n } from '@/lib/i18n/server';
import type { Category } from '@/lib/types';

export const metadata = { title: 'Overview' };

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser('/app/overview');
  const { t } = await getI18n();
  const params = await searchParams;
  const one = (k: string): string | undefined => (Array.isArray(params[k]) ? params[k][0] : params[k]) as string | undefined;

  const rangeDays = Math.min(90, Math.max(7, Number(one('range') ?? 30) || 30));
  const q = one('q');
  const category = (one('category') ?? 'all') as Category | 'all';
  const sortParam = one('sort');
  const sort = (['newest', 'lowest_price', 'highest_deal_score', 'biggest_price_drop', 'best_match'] as const).find(
    (s) => s === sortParam
  );
  const page = Math.max(1, Number(one('page') ?? 1) || 1);

  const billing = getPlanForUser(user.id);
  const kpis = analyticsRepo.getKpis(user.id, billing?.plan.monitor_limit ?? 3);
  const table = searchRepo.searchOpportunities(user.id, {
    q,
    category,
    sort: sort ?? 'newest',
    page,
    per_page: 10,
  });

  const db = getDb();
  const histories: Record<string, ReturnType<typeof getHistory>> = {};
  for (const o of table.rows) histories[o.id] = getHistory(db, o.id);

  const monitors = monitorsRepo.listMonitors(user.id);
  const collections = collectionsRepo.listCollections(user.id).map((c) => ({ id: c.id, name: c.name }));
  const recentQueries = searchRepo.getRecentQueries(user.id);
  const activity = listActivity(user.id, { limit: 10 });

  const discoveries = analyticsRepo.getDiscoveries(user.id, rangeDays);
  const priceDrops = analyticsRepo.getPriceDropsByCategory(user.id, rangeDays);
  const scoreDist = analyticsRepo.getDealScoreDistribution(user.id, rangeDays);
  const marketVsListing = analyticsRepo.getMarketVsListing(user.id);
  const avgDealScore = table.rows.length
    ? Math.round(table.rows.reduce((s, o) => s + o.deal_score, 0) / table.rows.length)
    : 0;

  const latest = searchRepo.searchOpportunities(user.id, { sort: 'newest', per_page: 1 }).rows[0] ?? null;
  const latestHistory = latest ? getHistory(db, latest.id) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            {t('overview.title')}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {t('overview.subtitle')}
          </p>
        </div>
        <Link
          href="/app/monitors?new=1"
          className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="size-4" strokeWidth={2} aria-hidden />
          New Monitor
        </Link>
      </div>

      <KpiRow kpis={kpis} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <DiscoveryPanel recentQueries={recentQueries} />

          <Card>
            <CardHeader>
              <div>
                <CardTitle>{t('overview.freshTitle')}</CardTitle>
                <CardSubtitle>{t('overview.freshSubtitle')}</CardSubtitle>
              </div>
            </CardHeader>
            <CardContent>
              <OpportunitiesTable
                rows={table.rows}
                histories={histories}
                count={table.count}
                page={table.page}
                totalPages={table.total_pages}
                q={q}
                category={category}
                sort={sort ?? 'newest'}
                basePath="/app/overview"
                collections={collections}
              />
            </CardContent>
          </Card>

          <MarketChartsSection
            rangeDays={rangeDays}
            discoveries={discoveries}
            priceDrops={priceDrops}
            scoreDistribution={scoreDist}
            avgDealScore={avgDealScore}
            marketVsListing={marketVsListing}
          />

          <ActivityCard events={activity} />
        </div>

        <aside className="min-w-0 space-y-6" aria-label="Context panel">
          <ContextPanel opportunity={latest} history={latestHistory} monitors={monitors} />
          <ActiveMonitors monitors={monitors} />
        </aside>
      </div>
    </div>
  );
}
