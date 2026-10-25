'use client';

/* Discover results: grid/table toggle, sort, save search, cards + drawer (plan §26). */
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookmarkPlus, LayoutGrid, Rows3, SearchX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Money, PaginationLinks, PriceDelta, RelativeTime } from '@/components/ui/atoms';
import { OrbitBadge, SampleBadge } from '@/components/ui/badges';
import { ScoreBar } from '@/components/ui/score-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { OpportunityDrawer } from '@/components/app/opportunity-drawer';
import { OpportunitiesTable } from '@/components/app/opportunities-table';
import { saveSearchAction } from '@/lib/actions/app';
import { toastSuccess } from '@/components/ui/toast-helpers';
import { type Category, type Opportunity, type OpportunityFilters, type PriceHistoryPoint } from '@/lib/types';
import { cn } from '@/lib/easyui/utils';
import { useI18n } from '@/lib/i18n/context';

const SORTS: Array<{ value: NonNullable<OpportunityFilters['sort']>; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'lowest_price', label: 'Lowest price' },
  { value: 'highest_deal_score', label: 'Highest deal score' },
  { value: 'biggest_price_drop', label: 'Biggest price drop' },
  { value: 'best_match', label: 'Best match' },
];

export function DiscoverResults({
  rows,
  histories,
  count,
  page,
  totalPages,
  q,
  category,
  sort,
  collections,
}: {
  rows: Opportunity[];
  histories: Record<string, PriceHistoryPoint[]>;
  count: number;
  page: number;
  totalPages: number;
  q: string;
  category: Category | 'all';
  sort: OpportunityFilters['sort'];
  collections: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = React.useState<'grid' | 'table'>('grid');
  const { t } = useI18n();
  const [drawerOpp, setDrawerOpp] = React.useState<Opportunity | null>(null);
  const hasFilters = q.length > 0 || category !== 'all' || Array.from(searchParams.keys()).some((k) => !['q', 'category', 'sort', 'page', 'view'].includes(k));

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value == null || value === '') params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`/app/discover?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-w-0 flex-1 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="tnum text-[13px] text-[var(--text-muted)]" aria-live="polite">
          <span className="font-semibold text-[var(--text-primary)]">{count}</span> {count === 1 ? t('common.result') : t('discover.opportunities')}
          {q && (
            <>
              {' '}for “<span className="font-medium text-[var(--text-primary)]">{q}</span>”
            </>
          )}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={sort ?? 'newest'}
            onChange={(e) => setParam('sort', e.target.value === 'newest' ? null : e.target.value)}
            aria-label={t('table.sort')}
            className="focus-ring h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[13px] text-[var(--text-secondary)]"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <div className="flex items-center rounded-lg border border-[var(--border)] p-0.5" role="group" aria-label="View">
            {([['grid', LayoutGrid, 'Grid view'], ['table', Rows3, 'Table view']] as const).map(([v, Icon, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                aria-label={label}
                className={cn(
                  'focus-ring grid size-8 place-items-center rounded-md transition-colors',
                  view === v ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              void saveSearchAction(q, category);
              toastSuccess('Search saved', 'Find it again under Recent searches on the Overview page.');
            }}
            disabled={!q}
            title={q ? t('discover.saveSearchTitle') : t('discover.saveSearchDisabled')}
            className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
          >
            <BookmarkPlus className="size-3.5" aria-hidden /> {t('discover.saveSearch')}
          </button>
          <Link
            href={`/app/monitors?new=1${q ? `&prefill=${encodeURIComponent(q)}` : ''}${category !== 'all' ? `&category=${category}` : ''}`}
            className="focus-ring inline-flex h-9 items-center rounded-lg bg-[var(--accent)] px-3 text-[13px] font-medium text-white hover:opacity-90"
          >
            {t('nav.newMonitor')}
          </Link>
        </div>
      </div>

      {count === 0 ? (
        <EmptyState
          icon={SearchX}
          title={t('discover.empty')}
          description={t('discover.emptyHint')}
          action={
            hasFilters ? (
              <button
                type="button"
                onClick={() => router.push('/app/discover')}
                className="focus-ring h-9 rounded-lg border border-[var(--border)] px-3.5 text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              >
                {t('common.clearAll')}
              </button>
            ) : undefined
          }
        />
      ) : view === 'grid' ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((o) => (
            <li key={o.id}>
              <Card className="group h-full transition-shadow hover:shadow-[var(--shadow-sm)]">
                <button
                  type="button"
                  onClick={() => setDrawerOpp(o)}
                  className="focus-ring block w-full rounded-xl text-left"
                  aria-label={`${t('common.open')}: ${o.title}`}
                >
                  {/* 16:9 visual placeholder — category-tinted, no fake product photos */}
                  <div
                    className="relative flex aspect-[16/9] items-center justify-center rounded-t-xl border-b border-[var(--border-subtle)]"
                    style={{
                      background: `linear-gradient(135deg, ${categoryGradient(o.category)})`,
                    }}
                    aria-hidden
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white/85">
                      {t(`category.${o.category}` as never)}
                    </span>
                  </div>
                  <CardContent className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <OrbitBadge tone={o.price_change_pct != null && o.price_change_pct < 0 ? 'positive' : 'neutral'}>
                        {o.source_marketplace}
                      </OrbitBadge>
                      {o.is_sample && <SampleBadge />}
                    </div>
                    <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[var(--text-primary)]">{o.title}</p>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <Money value={o.current_price} className="text-base" />
                        {o.previous_price != null && (
                          <span className="tnum ml-1.5 text-[11px] text-[var(--text-subtle)] line-through">
                            {o.previous_price.toLocaleString('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                          </span>
                        )}
                      </div>
                      <PriceDelta pct={o.price_change_pct} className="text-xs" />
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5">
                      <ScoreBar score={o.deal_score} />
                      <RelativeTime iso={o.discovered_at} className="text-[11px]" />
                    </div>
                    {o.estimated_market_value != null && (
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {t('table.reference')} {o.estimated_market_value.toLocaleString('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} · {t('label.illustrativeEstimate')}
                      </p>
                    )}
                  </CardContent>
                </button>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card>
          <CardContent>
            <OpportunitiesTable
              rows={rows}
              histories={histories}
              count={count}
              page={page}
              totalPages={totalPages}
              q={q}
              category={category}
              sort={sort ?? 'newest'}
              basePath="/app/discover"
              collections={collections}
              showCategoryFilter={false}
            />
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && view === 'grid' && (
        <PaginationLinks
          page={page}
          totalPages={totalPages}
          makeHref={(p) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(p));
            return `/app/discover?${params.toString()}`;
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

function categoryGradient(c: Category): string {
  switch (c) {
    case 'real_estate': return '#1D2939, #475467';
    case 'watches': return '#4A1D3F, #EC4899';
    case 'cars_parts': return '#0B3B2E, #12B76A';
    case 'electronics': return '#12275E, #2E90FA';
    case 'home_living': return '#3A2A6B, #7A5AF8';
    default: return '#344054, #98A2B3';
  }
}
