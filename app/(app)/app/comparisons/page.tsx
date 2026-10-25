import { requireUser } from '@/lib/auth/server';
import * as searchRepo from '@/lib/data/search';
import * as collectionsRepo from '@/lib/data/collections';
import { getComparableOpportunities } from '@/lib/data/search';
import { getPlanForUser } from '@/lib/data/misc';
import { ComparisonBuilder } from '@/components/app/comparison-builder';

export const metadata = { title: 'Comparisons' };

export default async function ComparisonsPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; collection?: string }>;
}) {
  const user = await requireUser('/app/comparisons');
  const { ids, collection: collectionId } = await searchParams;

  // Candidates: latest 40 visible opportunities.
  const candidates = searchRepo.searchOpportunities(user.id, { sort: 'newest', per_page: 40 }).rows;

  // Preselect: ?ids=a,b,c,d or the first items of a collection.
  let initialSelected = candidates.slice(0, 0);
  if (ids) {
    initialSelected = getComparableOpportunities(user.id, ids.split(',').filter(Boolean).slice(0, 4));
  } else if (collectionId) {
    const items = collectionsRepo.listCollectionItems(user.id, collectionId);
    initialSelected = items.slice(0, 4);
  }

  const billing = getPlanForUser(user.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Comparisons</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Line up 2–{billing?.plan.comparison_limit ?? 2} opportunities and see where the value is. Max{' '}
          {billing?.plan.comparison_limit ?? 2} on your {billing?.plan.name ?? 'Free'} plan.
        </p>
      </div>
      <ComparisonBuilder
        candidates={candidates}
        initialSelected={initialSelected}
        comparisonLimit={billing?.plan.comparison_limit ?? 2}
      />
    </div>
  );
}
