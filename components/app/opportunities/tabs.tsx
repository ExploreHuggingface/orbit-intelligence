'use client';

/* Opportunities list (plan §27): status tabs with counts, bulk action bar. */
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCheck, Layers, Star, SearchCheck, CircleSlash, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/easyui/utils';
import { bulkUpdateStatusAction } from '@/lib/actions/app';
import { toastSuccess, actionError } from '@/components/ui/toast-helpers';
import { STATUS_LABELS, type OpportunityStatus } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

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
  const { t: tr } = useI18n();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Opportunity status">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              if (tab.value === 'all') params.delete('status');
              else params.set('status', tab.value);
              params.delete('page');
              router.push(`/app/opportunities?${params.toString()}`, { scroll: false });
            }}
            className={cn(
              'focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors',
              activeTab === tab.value
                ? 'border-transparent bg-[var(--accent)] text-white'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.label === 'All' ? tr('opp.tab.all') : STATUS_LABELS[tab.value as keyof typeof STATUS_LABELS] ? tr(`status.${tab.value}` as never) : tab.label}
            <span className={cn('tnum text-[11px]', activeTab === tab.value ? 'text-white/70' : 'text-[var(--text-muted)]')}>
              {counts[tab.value] ?? 0}
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
  const { t } = useI18n();
  if (selectedIds.length === 0) return null;

  const apply = async (status: OpportunityStatus) => {
    setPending(status);
    const res = await bulkUpdateStatusAction(selectedIds, status);
    setPending(null);
    if (actionError(res)) return;
    toastSuccess(t('opp.bulkToast', { count: selectedIds.length, status: t(`status.${status}` as never) }));
    onDone();
    router.refresh();
  };

  const actions: Array<{ status: OpportunityStatus; label: string; Icon: typeof Star }> = [
    { status: 'shortlisted', label: 'opp.shortlist', Icon: Star },
    { status: 'under_review', label: 'opp.underReview', Icon: SearchCheck },
    { status: 'dismissed', label: 'opp.dismiss', Icon: CircleSlash },
    { status: 'purchased', label: 'opp.purchased', Icon: ShoppingBag },
  ];

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 mx-auto flex w-fit max-w-[92vw] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-lg)]">
      <span className="tnum text-[13px] font-medium text-[var(--text-primary)]">
        {selectedIds.length} {t('opp.selected')}
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
        aria-label={t('common.clearAll')}
        className="focus-ring grid size-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
      >
        <CheckCheck className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export { Layers };
