'use client';

/* Monitors table (plan §28): sort, search-within, pause/resume, edit, delete
   with confirm + Undo toast (5s), and the wizard mounted from ?new=1. */
import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, BellOff, Pause, Play, Pencil, Plus, Radar, Search, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { OrbitBadge } from '@/components/ui/badges';
import { EmptyState } from '@/components/ui/empty-state';
import { RelativeTime } from '@/components/ui/atoms';
import { Modal, ConfirmButtons } from '@/components/ui/modal';
import { MonitorForm } from '@/components/app/monitors/monitor-form';
import { deleteMonitorAction, restoreMonitorAction, setMonitorStatusAction } from '@/lib/actions/app';
import { toastError, toastSuccess } from '@/components/ui/toast-helpers';
import { type Monitor } from '@/lib/types';
import { cn } from '@/lib/easyui/utils';
import { useI18n } from '@/lib/i18n/context';

function frequencyLabel(minutes: number): string {
  if (minutes >= 1440) return 'Daily';
  if (minutes >= 60) return minutes % 60 === 0 ? `Every ${minutes / 60} h` : `Every ${minutes} min`;
  return `Every ${minutes} min`;
}

export function MonitorsTable({
  monitors,
  activeCount,
  planMonitorLimit,
  planName,
}: {
  monitors: Monitor[];
  activeCount: number;
  planMonitorLimit: number;
  planName: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = React.useState('');
  const [sort, setSort] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<Monitor | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [editing, setEditing] = React.useState<Monitor | null>(null);
  const { t } = useI18n();

  const openWizard = searchParams.get('new') === '1';
  const prefillCategory = searchParams.get('category') ?? undefined;
  const prefillDesc = searchParams.get('prefill') ?? undefined;
  const closeWizard = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('new');
    params.delete('prefill');
    params.delete('category');
    router.push(`/app/monitors${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  };

  const toggle = async (m: Monitor) => {
    setBusy(m.id);
    const next = m.status === 'active' ? 'paused' : 'active';
    const res = await setMonitorStatusAction(m.id, next);
    setBusy(null);
    if (!res.ok) { toastError(res.error ?? 'Failed'); return; }
    toastSuccess(next === 'paused' ? `Paused “${m.name}”` : `Resumed “${m.name}”`);
    router.refresh();
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const snapshot = { ...confirmDelete };
    const res = await deleteMonitorAction(confirmDelete.id);
    setDeleting(false);
    setConfirmDelete(null);
    if (!res.ok) { toastError(res.error ?? 'Failed'); return; }
    router.refresh();
    // Undo toast (5s restore from client-held copy, plan §28).
    const { toast } = await import('sonner');
    toast(`Deleted “${snapshot.name}”`, {
      description: 'Monitor removed from your workspace.',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          void (async () => {
            const restore = await restoreMonitorAction({
              name: snapshot.name,
              description: snapshot.description,
              category: snapshot.category,
              criteria: snapshot.criteria,
              sensitivity: snapshot.sensitivity,
              frequency_minutes: snapshot.frequency_minutes,
              notify_in_app: snapshot.notify_in_app,
              notify_email: snapshot.notify_email,
              digest_mode: snapshot.digest_mode,
              price_drop_only: snapshot.price_drop_only,
              status: snapshot.status,
              match_count: snapshot.match_count,
            });
            if (restore.ok) {
              toastSuccess(`Restored “${snapshot.name}”`);
              router.refresh();
            } else {
              toastError(restore.error ?? 'Could not restore');
            }
          })();
        },
      },
    });
  };

  const filtered = React.useMemo(() => {
    let rows = monitors;
    if (searchText) {
      const t = searchText.toLowerCase();
      rows = rows.filter((m) => m.name.toLowerCase().includes(t) || m.description.toLowerCase().includes(t));
    }
    if (sort) {
      const dir = sort.direction === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        switch (sort.key) {
          case 'name': return a.name.localeCompare(b.name) * dir;
          case 'matches': return (a.match_count - b.match_count) * dir;
          case 'checked': return (new Date(a.last_checked_at).getTime() - new Date(b.last_checked_at).getTime()) * dir;
          default: return 0;
        }
      });
    }
    return rows;
  }, [monitors, searchText, sort]);

  const columns: Column<Monitor>[] = [
    {
      key: 'name',
      header: t('nav.monitors'),
      sortable: true,
      sortValue: (m) => m.name,
      cell: (m) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-[var(--text-primary)]">{m.name}</p>
          <p className="truncate text-[11px] text-[var(--text-muted)]">{t(`category.${m.category}` as never)}</p>
        </div>
      ),
    },
    {
      key: 'matches',
      header: t('monitors.matches'),
      align: 'right',
      sortable: true,
      sortValue: (m) => m.match_count,
      cell: (m) => <span className="tnum font-medium">{m.match_count}</span>,
    },
    {
      key: 'checked',
      header: t('monitors.lastChecked'),
      align: 'right',
      sortable: true,
      sortValue: (m) => m.last_checked_at,
      cell: (m) => <RelativeTime iso={m.last_checked_at} />,
    },
    {
      key: 'frequency',
      header: t('monitors.refresh'),
      cell: (m) => <span className="text-[var(--text-secondary)]">{frequencyLabel(m.frequency_minutes)}</span>,
    },
    {
      key: 'status',
      header: t('monitors.status'),
      cell: (m) => (
        <OrbitBadge tone={m.status === 'active' ? 'positive' : 'neutral'}>{m.status === 'active' ? t('status.active') : t('status.paused')}</OrbitBadge>
      ),
    },
    {
      key: 'notify',
      header: t('monitors.alerts'),
      cell: (m) => (
        <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]" title={m.notify_in_app ? 'In-app alerts on' : 'Alerts off'}>
          {m.notify_in_app ? <Bell className="size-3.5" aria-hidden /> : <BellOff className="size-3.5" aria-hidden />}
          {m.digest_mode ? t('monitors.digest') : m.notify_in_app ? t('monitors.instant') : t('monitors.off')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (m) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => void toggle(m)}
            disabled={busy === m.id}
            aria-label={m.status === 'active' ? `Pause ${m.name}` : `Resume ${m.name}`}
            className="focus-ring grid size-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            {m.status === 'active' ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setEditing(m)}
            aria-label={`Edit ${m.name}`}
            className="focus-ring grid size-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(m)}
            aria-label={`Delete ${m.name}`}
            className="focus-ring grid size-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[color:var(--color-negative)] hover:text-[color:var(--color-negative)]"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const atLimit = planMonitorLimit >= 0 && activeCount >= planMonitorLimit;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-44 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-subtle)]" aria-hidden />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t('monitors.searchPlaceholder')}
              aria-label={t('common.search')}
              className="focus-ring h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-[13px] placeholder:text-[var(--text-subtle)]"
            />
          </div>
          <p className="tnum text-xs text-[var(--text-muted)]">
            {t('monitors.activeOfTotal', { active: activeCount, total: monitors.length, plan: planName, limit: planMonitorLimit >= 0 ? planMonitorLimit : '∞' })}
          </p>
          <Link
            href="/app/monitors?new=1"
            aria-disabled={atLimit}
            title={atLimit ? `${planName} plan allows ${planMonitorLimit} monitors. Upgrade to add more.` : 'Create a monitor'}
            className={cn(
              'focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 text-[13px] font-medium text-white hover:opacity-90',
              atLimit && 'pointer-events-none opacity-40'
            )}
          >
            <Plus className="size-4" aria-hidden /> {t('nav.newMonitor')}
          </Link>
        </div>

        <DataTable
          ariaLabel={t('nav.monitors')}
          columns={columns}
          rows={filtered}
          isLoading={false}
          sort={sort}
          onSortChange={(key) =>
            setSort((s) =>
              s?.key === key
                ? s.direction === 'asc'
                  ? { key, direction: 'desc' }
                  : null
                : { key, direction: 'asc' }
            )
          }
          emptyState={
            <EmptyState
              icon={Radar}
              title={t('monitors.empty')}
              description={t('monitors.emptyHint')}
              action={
                <Link
                  href="/app/monitors?new=1"
                  className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 text-[13px] font-medium text-white hover:opacity-90"
                >
                  <Plus className="size-4" aria-hidden /> {t('monitors.createFirst')}
                </Link>
              }
            />
          }
        />
      </CardContent>

      {/* Create wizard */}
      {openWizard && !editing && (
        <MonitorForm
          mode="create"
          onCancel={closeWizard}
          onCreated={() => {
            closeWizard();
            toastSuccess('Monitor saved', 'Background crawling will activate when the backend is connected.');
            router.refresh();
          }}
          planMonitorLimit={planMonitorLimit}
          activeMonitors={activeCount}
          planName={planName}
          defaultCategory={
            (['real_estate', 'watches', 'cars_parts', 'electronics', 'home_living'] as const).find(
              (c) => c === prefillCategory
            ) ?? 'real_estate'
          }
          defaultDescription={prefillDesc ? `Watch for listings matching: ${prefillDesc}` : undefined}
        />
      )}

      {/* Edit wizard */}
      {editing && (
        <MonitorForm
          mode="edit"
          monitor={editing}
          onCancel={() => setEditing(null)}
          onCreated={() => {
            setEditing(null);
            toastSuccess('Monitor updated');
            router.refresh();
          }}
          planMonitorLimit={planMonitorLimit}
          activeMonitors={activeCount}
          planName={planName}
        />
      )}

      {/* Delete confirm */}
      <Modal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title={t('monitors.deleteTitle')}
        description={
          confirmDelete
            ? `This removes “${confirmDelete.name}” from your workspace. You can undo for 5 seconds after deleting.`
            : undefined
        }
        footer={
          <ConfirmButtons
            confirmLabel={t('monitors.deleteConfirm')}
            destructive
            pending={deleting}
            onConfirm={() => void doDelete()}
            onClose={() => setConfirmDelete(null)}
          />
        }
      />
    </Card>
  );
}
