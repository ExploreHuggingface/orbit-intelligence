'use client';

/* Opportunities table (plan §25.4/§27) with search-within, sort, pagination,
   and the detail drawer. Data comes from the server via props; controls
   sync to URL params so state is shareable and back/forward works. */
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Search } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/atoms';
import { Money, PriceDelta, RelativeTime } from '@/components/ui/atoms';
import { OrbitBadge, StatusBadge } from '@/components/ui/badges';
import { ScoreBar } from '@/components/ui/score-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { OpportunityDrawer } from '@/components/app/opportunity-drawer';
import { Sparkles, SearchX } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  type Category,
  type Opportunity,
  type OpportunityFilters,
  type PriceHistoryPoint,
} from '@/lib/types';
import { cn } from '@/lib/easyui/utils';

const SORTS: Array<{ value: NonNullable<OpportunityFilters['sort']>; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'lowest_price', label: 'Lowest price' },
  { value: 'highest_deal_score', label: 'Highest deal score' },
  { value: 'biggest_price_drop', label: 'Biggest price drop' },
];

export function OpportunitiesTable({
  rows,
  histories,
  count,
  page,
  totalPages,
  q,
  category,
  sort,
  basePath,
  collections,
  showCategoryFilter = true,
  selectable = false,
  selectedIds,
  onSelectionChange,
  className,
}: {
  rows: Opportunity[];
  histories: Record<string, PriceHistoryPoint[]>;
  count: number;
  page: number;
  totalPages: number;
  q?: string;
  category?: Category | 'all';
  sort?: OpportunityFilters['sort'];
  basePath: string;
  collections: Array<{ id: string; name: string }>;
  showCategoryFilter?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = React.useState(q ?? '');
  const [drawerOpp, setDrawerOpp] = React.useState<Opportunity | null>(null);
  const [sortOpen, setSortOpen] = React.useState(false);
  const { t } = useI18n();
  const selected = new Set(selectedIds ?? []);
  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange?.(Array.from(next));
  };

  const pushParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '') params.delete(k);
      else params.set(k, v);
    }
    params.delete('page');
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  const columns: Column<Opportunity>[] = [
    ...(selectable
      ? [
          {
            key: 'select',
            header: '',
            width: '36px',
            cell: (o: Opportunity) => (
              <input
                type="checkbox"
                checked={selected.has(o.id)}
                onChange={() => toggleSelect(o.id)}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                aria-label={`Select ${o.title}`}
                className="size-4 rounded accent-[var(--accent)]"
              />
            ),
          } as Column<Opportunity>,
        ]
      : []),
    {
      key: 'item',
      header: t('table.item'),
      sortable: false,
      cell: (o) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-[var(--text-primary)]">{o.title}</p>
          <p className="truncate text-[11px] text-[var(--text-muted)]">{o.source_marketplace}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('table.category'),
      cell: (o) => <OrbitBadge tone="neutral">{t(`category.${o.category}` as never)}</OrbitBadge>,
    },
    {
      key: 'price',
      header: t('table.price'),
      align: 'right',
      sortable: true,
      sortValue: (o) => o.current_price,
      cell: (o) => (
        <div>
          <Money value={o.current_price} />
          {o.price_change_pct != null && (
            <div className="text-[11px]">
              <PriceDelta pct={o.price_change_pct} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'reference',
      header: t('table.reference'),
      align: 'right',
      cell: (o) =>
        o.estimated_market_value != null ? (
          <Money value={o.estimated_market_value} className="text-[var(--text-secondary)]" />
        ) : (
          <span className="text-[var(--text-subtle)]">—</span>
        ),
    },
    {
      key: 'deal_score',
      header: t('table.dealScore'),
      align: 'right',
      sortable: true,
      sortValue: (o) => o.deal_score,
      cell: (o) => <ScoreBar score={o.deal_score} className="justify-end" />,
    },
    {
      key: 'status',
      header: t('table.status'),
      cell: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: 'discovered',
      header: t('table.discovered'),
      align: 'right',
      sortable: true,
      sortValue: (o) => o.discovered_at,
      cell: (o) => <RelativeTime iso={o.discovered_at} />,
    },
  ];

  const sortKeyMap: Record<string, NonNullable<OpportunityFilters['sort']>> = {
    price: 'lowest_price',
    deal_score: 'highest_deal_score',
    discovered: 'newest',
  };

  const currentSort = sort ?? 'newest';

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-44 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-subtle)]" aria-hidden />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') pushParams({ q: searchText });
            }}
            onBlur={() => {
              if ((q ?? '') !== searchText) pushParams({ q: searchText });
            }}
            placeholder={t('table.searchWithin')}
            aria-label={t('table.searchWithin')}
            className="focus-ring h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-[13px] placeholder:text-[var(--text-subtle)]"
          />
        </div>
        {showCategoryFilter && (
          <select
            value={category ?? 'all'}
            onChange={(e) => pushParams({ category: e.target.value === 'all' ? null : e.target.value })}
            aria-label={t('table.filterCategory')}
            className="focus-ring h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[13px] text-[var(--text-secondary)]"
          >
            <option value="all">{t('table.allCategories')}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            aria-expanded={sortOpen}
            aria-haspopup="menu"
            className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {t('table.sort')}: {SORTS.find((s) => s.value === currentSort) ? t(`table.sort.${currentSort}` as never) : ''}
            <ChevronDown className="size-3.5" aria-hidden />
          </button>
          {sortOpen && (
            <div
              role="menu"
              aria-label="Sort"
              className="absolute right-0 z-20 mt-1.5 w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-lg)]"
            >
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSortOpen(false);
                    pushParams({ sort: s.value === 'newest' ? null : s.value });
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
                    s.value === currentSort && 'font-medium text-[var(--text-primary)]'
                  )}
                >
                  {s.label}
                  {s.value === currentSort && <span aria-hidden>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="tnum ml-auto text-xs text-[var(--text-muted)]" aria-live="polite">
          {count} {count === 1 ? t('common.result') : t('common.results')}
        </p>
      </div>

      <DataTable
        ariaLabel={t('nav.opportunities')}
        columns={columns}
        rows={rows}
        isLoading={false}
        onRowClick={(o) => setDrawerOpp(o)}
        sort={
          currentSort === 'lowest_price'
            ? { key: 'price', direction: 'asc' }
            : currentSort === 'highest_deal_score'
              ? { key: 'deal_score', direction: 'desc' }
              : currentSort === 'biggest_price_drop'
                ? { key: 'price', direction: 'desc' }
                : { key: 'discovered', direction: 'desc' }
        }
        onSortChange={(key) => pushParams({ sort: sortKeyMap[key] ?? null })}
        emptyState={
          q || category !== 'all' ? (
            <EmptyState
              icon={SearchX}
              title={t('table.noMatches')}
              description={t('table.noMatchesHint')}
              action={
                <button
                  type="button"
                  onClick={() => pushParams({ q: null, category: null })}
                  className="focus-ring h-9 rounded-lg border border-[var(--border)] px-3.5 text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                >
                  {t('table.clearFilters')}
                </button>
              }
            />
          ) : (
            <EmptyState
              icon={Sparkles}
              title={t('table.nothingHere')}
              description={t('table.nothingHereHint')}
            />
          )
        }
      />

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(p) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(p));
            router.push(`${basePath}?${params.toString()}`, { scroll: false });
          }}
          className="justify-center"
        />
      )}

      <OpportunityDrawer
        opportunity={drawerOpp}
        history={drawerOpp ? (histories[drawerOpp.id] ?? []) : []}
        collections={collections}
        open={drawerOpp !== null}
        onClose={() => setDrawerOpp(null)}
      />
    </div>
  );
}
