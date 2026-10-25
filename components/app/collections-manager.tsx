'use client';

/* Collections manager (plan §29): left list, grid/table items, create inline,
   remove with undo, empty state. */
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FolderOpen, FolderPlus, Plus, Sparkles, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Money, PriceDelta, RelativeTime } from '@/components/ui/atoms';
import { OrbitBadge, SampleBadge } from '@/components/ui/badges';
import { ScoreBar } from '@/components/ui/score-bar';
import { OpportunityDrawer } from '@/components/app/opportunity-drawer';
import { createCollectionAction, deleteCollectionAction, removeFromCollectionAction } from '@/lib/actions/app';
import { toastError, toastSuccess } from '@/components/ui/toast-helpers';
import type { Collection, Opportunity, PriceHistoryPoint } from '@/lib/types';
import { cn } from '@/lib/easyui/utils';
import { useI18n } from '@/lib/i18n/context';

export function CollectionsManager({
  collections,
  activeCollection,
  items,
  planCollectionLimit,
  planName,
  histories = {},
}: {
  collections: Collection[];
  activeCollection: Collection | null;
  items: Opportunity[];
  planCollectionLimit: number;
  planName: string;
  histories?: Record<string, PriceHistoryPoint[]>;
}) {
  const router = useRouter();
  const [creating, setCreating] = React.useState(false);
  const [name, setName] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [drawerOpp, setDrawerOpp] = React.useState<Opportunity | null>(null);
  const { t } = useI18n();
  const atLimit = planCollectionLimit >= 0 && collections.length >= planCollectionLimit;

  const create = async () => {
    setPending(true);
    const fd = new FormData();
    fd.set('name', name);
    const res = await createCollectionAction(null, fd);
    setPending(false);
    if (!res.ok) { toastError(res.error ?? 'Could not create collection'); return; }
    toastSuccess(t('collections.createdToast', { name }));
    setName('');
    setCreating(false);
    router.push(`/app/collections?collection=${res.data?.id}`);
    router.refresh();
  };

  const removeItem = async (opp: Opportunity) => {
    if (!activeCollection) return;
    const res = await removeFromCollectionAction(activeCollection.id, opp.id);
    if (!res.ok) { toastError(res.error ?? 'Failed'); return; }
    router.refresh();
    const { toast } = await import('sonner');
    toast(t('collections.removedToast', { title: opp.title.slice(0, 40) + (opp.title.length > 40 ? '…' : '') }), {
      duration: 5000,
      action: {
        label: t('common.undo'),
        onClick: () => {
          void (async () => {
            const { addToCollectionAction } = await import('@/lib/actions/app');
            const undo = await addToCollectionAction(activeCollection.id, opp.id);
            if (undo.ok) { toastSuccess(t('collections.restoredToast')); router.refresh(); }
          })();
        },
      },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Left list */}
      <aside className="space-y-2" aria-label="Collections">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/app/collections?collection=${c.id}`}
            aria-current={activeCollection?.id === c.id ? 'page' : undefined}
            className={cn(
              'focus-ring flex items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-[13px] transition-colors',
              activeCollection?.id === c.id
                ? 'border-[color:var(--color-brand)] bg-[color:var(--color-brand-subtle)] font-medium text-[var(--text-primary)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <FolderOpen className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="truncate">{c.name}</span>
            </span>
            <span className="tnum shrink-0 text-[11px] text-[var(--text-muted)]">{c.item_count ?? 0}</span>
          </Link>
        ))}

        {creating ? (
          <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void create()}
              placeholder={t('collections.namePlaceholder')}
              aria-label={t('collections.newCollection')}
              autoFocus
              className="focus-ring h-9 w-full rounded-lg border border-[var(--border)] px-2.5 text-[13px]"
            />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => void create()}
                disabled={pending || name.trim().length < 2}
                className="focus-ring h-8 flex-1 rounded-lg bg-[var(--accent)] text-xs font-medium text-white disabled:opacity-50"
              >
                {t('common.create')}
              </button>
              <button
                type="button"
                onClick={() => { setCreating(false); setName(''); }}
                className="focus-ring grid size-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-muted)]"
                aria-label={t('common.cancel')}
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            disabled={atLimit}
            title={atLimit ? t('collections.limitToast', { plan: planName, limit: planCollectionLimit }) : t('collections.newCollection')}
            className={cn(
              'focus-ring flex w-full items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-3.5 py-2.5 text-[13px] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]',
              atLimit && 'cursor-not-allowed opacity-40'
            )}
          >
            <FolderPlus className="size-4" strokeWidth={1.75} aria-hidden />
            {atLimit ? t('collections.limitReached', { limit: planCollectionLimit }) : t('collections.newCollection')}
          </button>
        )}

        {collections.length > 0 && activeCollection && collections.length > 1 && (
          <button
            type="button"
            onClick={async () => {
              const res = await deleteCollectionAction(activeCollection.id);
              if (!res.ok) { toastError(res.error ?? 'Failed'); return; }
              toastSuccess(t('collections.deletedToast', { name: activeCollection.name }));
              router.push('/app/collections');
              router.refresh();
            }}
            className="focus-ring w-full rounded-lg px-3.5 py-2 text-left text-xs text-[var(--text-muted)] hover:text-[color:var(--color-negative)]"
          >
            {t('collections.deleteCollection', { name: activeCollection.name })}
          </button>
        )}
      </aside>

      {/* Items */}
      <div className="min-w-0">
        {!activeCollection ? (
          <EmptyState
            icon={FolderOpen}
            title={collections.length === 0 ? t('collections.noCollections') : t('collections.selectCollection')}
            description={
              collections.length === 0
                ? t('collections.noCollectionsHint')
                : t('collections.selectHint')
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={t('collections.emptyTitle', { name: activeCollection.name })}
            description={t('collections.emptyHint')}
            action={
              <Link
                href="/app/discover"
                className="focus-ring inline-flex h-9 items-center rounded-lg bg-[var(--accent)] px-3.5 text-[13px] font-medium text-white hover:opacity-90"
              >
                <Plus className="mr-1.5 size-4" aria-hidden /> {t('collections.discoverCta')}
              </Link>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((o) => (
              <li key={o.id}>
                <Card className="group relative h-full transition-shadow hover:shadow-[var(--shadow-sm)]">
                  <button
                    type="button"
                    onClick={() => setDrawerOpp(o)}
                    aria-label={`${t('common.open')}: ${o.title}`}
                    className="focus-ring block w-full rounded-xl text-left"
                  >
                    <CardContent className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <OrbitBadge tone="neutral">{o.source_marketplace}</OrbitBadge>
                        {o.is_sample && <SampleBadge />}
                      </div>
                      <p className="line-clamp-2 text-[13px] font-medium leading-snug">{o.title}</p>
                      <div className="flex items-end justify-between gap-2">
                        <Money value={o.current_price} className="text-base" />
                        <PriceDelta pct={o.price_change_pct} className="text-xs" />
                      </div>
                      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5">
                        <ScoreBar score={o.deal_score} />
                        <RelativeTime iso={o.discovered_at} className="text-[11px]" />
                      </div>
                    </CardContent>
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeItem(o)}
                    aria-label={`${t('common.remove')}: ${o.title}`}
                    className="focus-ring absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-lg text-[var(--text-muted)] opacity-0 transition-opacity hover:bg-[var(--surface-hover)] hover:text-[color:var(--color-negative)] group-hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <OpportunityDrawer
        opportunity={drawerOpp}
        history={drawerOpp ? (histories[drawerOpp.id] ?? []) : []}
        collections={collections.map((c) => ({ id: c.id, name: c.name }))}
        open={drawerOpp !== null}
        onClose={() => setDrawerOpp(null)}
      />
    </div>
  );
}
