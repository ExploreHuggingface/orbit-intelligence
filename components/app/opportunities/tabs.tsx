'use client';

/* Opportunities list (plan §27): status tabs with counts, bulk action bar. */
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCheck, Layers, Star, SearchCheck, CircleSlash, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/easyui/utils';
import { bulkUpdateStatusAction } from '@/lib/actions/app';
import { toastSuccess, actionError } from '@/components/ui/toast-helpers';
import { STATUS_LABELS, type OpportunityStatus } from '@/lib/types';

const TABS: Array<{ value: OpportunityStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'purchased', label: 'Purchased' },
];

export function OpportunitiesTabs({
  counts,
  activeTab,
  children,
}: {
  counts: Record<string, number>;
  activeTab: OpportunityStatus | 'all';
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Opportunity status">
        {TABS.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={activeTab === t.value}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              if (t.value === 'all') params.delete('status');
              else params.set('status', t.value);
              params.delete('page');
              router.push(`/app/opportunities?${params.toString()}`, { scroll: false });
            }}
            className={cn(
              'focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors',
              activeTab === t.value
                ? 'border-transparent bg-[var(--accent)] text-white'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
            )}
          >
            {t.label}
            <span className={cn('tnum text-[11px]', activeTab === t.value ? 'text-white/70' : 'text-[var(--text-muted)]')}>
              {counts[t.value] ?? 0}
            </span>
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}

/** Bulk action bar shown when rows are selected (plan §27). */
export function BulkActionBar({
  selectedIds,
  onDone,
}: {
  selectedIds: string[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);
  if (selectedIds.length === 0) return null;

  const apply = async (status: OpportunityStatus) => {
    setPending(status);
    const res = await bulkUpdateStatusAction(selectedIds, status);
    setPending(null);
    if (actionError(res)) return;
    toastSuccess(`${selectedIds.length} opportunities → ${STATUS_LABELS[status]}`);
    onDone();
    router.refresh();
  };

  const actions: Array<{ status: OpportunityStatus; label: string; Icon: typeof Star }> = [
    { status: 'shortlisted', label: 'Shortlist', Icon: Star },
    { status: 'under_review', label: 'Under review', Icon: SearchCheck },
    { status: 'dismissed', label: 'Dismiss', Icon: CircleSlash },
    { status: 'purchased', label: 'Purchased', Icon: ShoppingBag },
  ];

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 mx-auto flex w-fit max-w-[92vw] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-lg)]">
      <span className="tnum text-[13px] font-medium text-[var(--text-primary)]">
        {selectedIds.length} selected
      </span>
      <span className="h-5 w-px bg-[var(--border)]" aria-hidden />
      {actions.map(({ status, label, Icon }) => (
        <button
          key={status}
          type="button"
          onClick={() => void apply(status)}
          disabled={pending !== null}
          className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
        >
          <Icon className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onDone}
        aria-label="Clear selection"
        className="focus-ring grid size-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
      >
        <CheckCheck className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export { Layers };
