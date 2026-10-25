import { requireUser } from '@/lib/auth/server';
import * as searchRepo from '@/lib/data/search';
import { getHistory } from '@/lib/db/rows';
import { getDb } from '@/lib/db';
import { PriceHistoryView, type TrackedItem } from '@/components/app/price-history-view';
import { CATEGORY_LABELS } from '@/lib/types';

export const metadata = { title: 'Price History' };

export default async function PriceHistoryPage() {
  const user = await requireUser('/app/price-history');
  const rows = searchRepo.searchOpportunities(user.id, { per_page: 40, sort: 'newest' }).rows;
  const db = getDb();

  const items: TrackedItem[] = rows
    .map((o) => {
      const points = getHistory(db, o.id);
      if (points.length < 2) return null;
      return {
        id: o.id,
        title: o.title,
        category_label: CATEGORY_LABELS[o.category],
        current_price: o.current_price,
        reference_value: o.estimated_market_value,
        first_seen: o.discovered_at,
        points,
      };
    })
    .filter((i): i is TrackedItem => i !== null)
    .slice(0, 24);

  return <PriceHistoryView items={items} />;
}
