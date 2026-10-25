import { requireUser } from '@/lib/auth/server';
import * as searchRepo from '@/lib/data/search';
import * as collectionsRepo from '@/lib/data/collections';
import { getHistory } from '@/lib/db/rows';
import { getDb } from '@/lib/db';
import { CategoryChips, FilterPanel } from '@/components/app/discover/filter-panel';
import { DiscoverResults } from '@/components/app/discover/discover-results';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES, type Category } from '@/lib/types';
import { getI18n } from '@/lib/i18n/server';

export const metadata = { title: 'Discover' };

function num(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser('/app/discover');
  const { t } = await getI18n();
  const params = await searchParams;
  const one = (k: string): string | undefined => (Array.isArray(params[k]) ? params[k][0] : params[k]) as string | undefined;

  const q = one('q') ?? '';
  const category = (CATEGORIES as readonly string[]).includes(one('category') ?? '')
    ? (one('category') as Category)
    : 'all';
  const sortParam = one('sort');
  const sort = (['newest', 'lowest_price', 'highest_deal_score', 'biggest_price_drop', 'best_match'] as const).find(
    (s) => s === sortParam
  );
  const page = Math.max(1, Number(one('page') ?? 1) || 1);

  // Log the query (recent searches, top 10 via GROUP BY).
  if (q) searchRepo.saveSearchRecord(user.id, q, category);

  const list = searchRepo.searchOpportunities(user.id, {
    q,
    category,
    sort: sort ?? 'newest',
    page,
    per_page: 12,
    city: one('city')?.split(','),
    neighborhoods: one('neighborhoods')?.split(','),
    price_min: num(one('price_min')),
    price_max: num(one('price_max')),
    property_type: one('property_type'),
    bedrooms_min: num(one('bedrooms_min')),
    yield_min: num(one('yield_min')),
    price_per_m2_max: num(one('ppm2')),
    brand: one('brand')?.split(','),
    condition: one('condition'),
    marketplaces: one('marketplaces')?.split(','),
    price_drop_only: one('price_drop_only') === '1',
  });

  const db = getDb();
  const histories: Record<string, ReturnType<typeof getHistory>> = {};
  for (const o of list.rows) histories[o.id] = getHistory(db, o.id);

  const facets = searchRepo.getFacets(user.id);
  const collections = collectionsRepo.listCollections(user.id).map((c) => ({ id: c.id, name: c.name }));
  const recentQueries = searchRepo.getRecentQueries(user.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{t('discover.title')}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {t('discover.subtitle')}
        </p>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="py-4">
          <form action="/app/discover" method="get" role="search" className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={t('discover.searchPlaceholder')}
              aria-label="Search opportunities"
              className="focus-ring h-10 min-w-52 flex-1 rounded-lg border border-[var(--border)] bg-[var(--color-surface-subtle)] px-3.5 text-sm placeholder:text-[var(--text-subtle)]"
            />
            {category !== 'all' && <input type="hidden" name="category" value={category} />}
            <button
              type="submit"
              className="focus-ring h-10 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white hover:opacity-90"
            >
              Search
            </button>
          </form>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CategoryChips active={category} />
            {recentQueries.length > 0 && !q && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.02em] text-[var(--text-subtle)]">Recent</span>
                {recentQueries.slice(0, 3).map((rq) => (
                  <a
                    key={rq}
                    href={`/app/discover?q=${encodeURIComponent(rq)}`}
                    className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                  >
                    {rq}
                  </a>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-5 lg:flex-row">
        <FilterPanel facets={facets} category={category} />
        <DiscoverResults
          rows={list.rows}
          histories={histories}
          count={list.count}
          page={list.page}
          totalPages={list.total_pages}
          q={q}
          category={category}
          sort={sort ?? 'newest'}
          collections={collections}
        />
      </div>
    </div>
  );
}
