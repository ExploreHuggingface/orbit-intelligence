'use client';

/* Active Monitors widget (plan §25.5) with inline pause/resume. */
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Bell, BellOff, Pause, Play, Radar } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { OrbitBadge } from '@/components/ui/badges';
import { EmptyState } from '@/components/ui/empty-state';
import { RelativeTime } from '@/components/ui/atoms';
import { setMonitorStatusAction } from '@/lib/actions/app';
import { toastSuccess, actionError } from '@/components/ui/toast-helpers';
import { useI18n } from '@/lib/i18n/context';
import { CATEGORY_LABELS, type Monitor } from '@/lib/types';

export function ActiveMonitors({ monitors }: { monitors: Monitor[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = React.useState<string | null>(null);

  const toggle = async (m: Monitor) => {
    setBusy(m.id);
    const next = m.status === 'active' ? 'paused' : 'active';
    const res = await setMonitorStatusAction(m.id, next);
    setBusy(null);
    if (actionError(res)) return;
    toastSuccess(next === 'paused' ? `Paused “${m.name}”` : `Resumed “${m.name}”`);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('overview.monitorsWidget')}</CardTitle>
        <span className="tnum text-xs text-[var(--text-muted)]">
          {t('overview.monitorsActiveTotal', { total: monitors.length }).replace('{total}', String(monitors.length))}
        </span>
      </CardHeader>
      <CardContent className="space-y-1 p-2">
        {monitors.length === 0 ? (
          <EmptyState
            icon={Radar}
            title={t('overview.noMonitors')}
            description={t('overview.noMonitorsHint')}
            action={
              <Link
                href="/app/monitors?new=1"
                className="focus-ring inline-flex h-9 items-center rounded-lg bg-[var(--accent)] px-3.5 text-[13px] font-medium text-white hover:opacity-90"
              >
                {t('overview.createMonitor')}
              </Link>
            }
            className="border-0 py-8"
          />
        ) : (
          monitors.slice(0, 5).map((m) => (
            <div
              key={m.id}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--color-surface-subtle)]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/app/monitors?id=${m.id}`}
                    className="focus-ring truncate rounded text-[13px] font-medium text-[var(--text-primary)] hover:underline"
                  >
                    {m.name}
                  </Link>
                  {m.status === 'paused' && <OrbitBadge tone="neutral">{t('status.paused')}</OrbitBadge>}
                </div>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-[var(--text-muted)]">
                  <span>{CATEGORY_LABELS[m.category]}</span>
                  <span aria-hidden>·</span>
                  <span className="tnum">{m.match_count} {t('overview.context.matches')}</span>
                  <span aria-hidden>·</span>
                  <span>
                    {t('overview.checked')} <RelativeTime iso={m.last_checked_at} />
                  </span>
                  <span className="inline-flex items-center gap-0.5" title={m.notify_in_app ? 'In-app alerts on' : 'Alerts off'}>
                    {m.notify_in_app ? <Bell className="size-3" /> : <BellOff className="size-3" />}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => void toggle(m)}
                disabled={busy === m.id}
                aria-label={m.status === 'active' ? `Pause ${m.name}` : `Resume ${m.name}`}
                className="focus-ring grid size-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                {m.status === 'active' ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </button>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter>
        <Link
          href="/app/monitors?new=1"
          className="focus-ring rounded text-xs font-medium text-[color:var(--color-brand)] hover:underline"
        >
          + {t('overview.createMonitor')}
        </Link>
        <Link
          href="/app/monitors"
          className="focus-ring inline-flex items-center gap-1 rounded text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          {t('common.viewAll')} <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
