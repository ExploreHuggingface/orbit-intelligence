'use client';

/* Opportunities page client shell: tabs + selectable table + bulk bar. */
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { OpportunitiesTable } from '@/components/app/opportunities-table';
import { BulkActionBar } from '@/components/app/opportunities/tabs';
import type { Category, Opportunity, OpportunityFilters, OpportunityStatus, PriceHistoryPoint } from '@/lib/types';

export function OpportunitiesList({
  rows,
  histories,
  count,
  page,
  totalPages,
  q,
  category,
  sort,
  status,
  collections,
}: {
  rows: Opportunity[];
  histories: Record<string, PriceHistoryPoint[]>;
  count: number;
  page: number;
  totalPages: number;
  q?: string;
  category?: Category | 'all';
  sort?: OpportunityFilters['sort'];
  status: OpportunityStatus | 'all';
  collections: Array<{ id: string; name: string }>;
}) {
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  // Reset selection when the tab/page changes.
  const paramKey = searchParams.toString();
  React.useEffect(() => setSelectedIds([]), [paramKey]);

  return (
    <>
      <OpportunitiesTable
        rows={rows}
        histories={histories}
        count={count}
        page={page}
        totalPages={totalPages}
        q={q}
        category={category}
        sort={sort ?? 'newest'}
        basePath="/app/opportunities"
        collections={collections}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
      <BulkActionBar selectedIds={selectedIds} onDone={() => setSelectedIds([])} />
      <input type="hidden" data-status={status} readOnly />
    </>
  );
}
