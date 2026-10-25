import { requireUser } from '@/lib/auth/server';
import * as searchRepo from '@/lib/data/search';
import * as collectionsRepo from '@/lib/data/collections';
import { getHistory } from '@/lib/db/rows';
import { getDb } from '@/lib/db';
import { OpportunitiesTabs } from '@/components/app/opportunities/tabs';
import { OpportunitiesList } from '@/components/app/opportunities/opportunities-list';
import { CATEGORIES, OPPORTUNITY_STATUSES, type Category, type OpportunityStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Opportunities' };

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser('/app/opportunities');
  const params = await searchParams;
  const one = (k: string): string | undefined => (Array.isArray(params[k]) ? params[k][0] : params[k]) as string | undefined;

  const status = (OPPORTUNITY_STATUSES as readonly string[]).includes(one('status') ?? '')
    ? (one('status') as OpportunityStatus)
    : 'all';
  const q = one('q');
  const category = (CATEGORIES as readonly string[]).includes(one('category') ?? '')
    ? (one('category') as Category)
    : 'all';
  const sortParam = one('sort');
  const sort = (['newest', 'lowest_price', 'highest_deal_score', 'biggest_price_drop', 'best_match'] as const).find(
    (s) => s === sortParam
  );
  const page = Math.max(1, Number(one('page') ?? 1) || 1);

  const list = searchRepo.searchOpportunities(user.id, {
    q,
    category,
    status: status === 'all' ? 'all' : status,
    sort: sort ?? 'newest',
    page,
    per_page: 10,
  });
  const counts = searchRepo.getCountsByStatus(user.id);

  const db = getDb();
  const histories: Record<string, ReturnType<typeof getHistory>> = {};
  for (const o of list.rows) histories[o.id] = getHistory(db, o.id);
  const collections = collectionsRepo.listCollections(user.id).map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Opportunities</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Every match ORBIT has found for you, scored and sortable. Select rows for bulk actions.
        </p>
      </div>
      <OpportunitiesTabs counts={counts} activeTab={status}>
        <Card>
          <CardContent>
            <OpportunitiesList
              rows={list.rows}
              histories={histories}
              count={list.count}
              page={list.page}
              totalPages={list.total_pages}
              q={q}
              category={category}
              sort={sort ?? 'newest'}
              status={status}
              collections={collections}
            />
          </CardContent>
        </Card>
      </OpportunitiesTabs>
    </div>
  );
}
