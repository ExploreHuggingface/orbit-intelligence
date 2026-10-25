'use client';

/* Notifications page (plan §31): type tabs, mark read on click + navigate. */
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDownRight, BellRing, Radar, RefreshCw, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { RelativeTime } from '@/components/ui/atoms';
import { markAllReadAction, markNotificationReadAction } from '@/lib/actions/app';
import { toastSuccess } from '@/components/ui/toast-helpers';
import type { AppNotification, NotificationType } from '@/lib/types';
import { cn } from '@/lib/easyui/utils';
import { useI18n } from '@/lib/i18n/context';

const TYPE_META: Record<NotificationType, { label: string; key: string; Icon: typeof Radar; tone: string }> = {
  price_drop: { label: 'Price Drops', key: 'notif.tab.priceDrops', Icon: ArrowDownRight, tone: 'text-[color:var(--color-positive)]' },
  new_match: { label: 'New Matches', key: 'notif.tab.newMatches', Icon: Radar, tone: 'text-[color:var(--color-brand)]' },
  availability: { label: 'Availability', key: 'notif.tab.availability', Icon: BellRing, tone: 'text-[color:var(--color-warning)]' },
  monitor_update: { label: 'Monitor Updates', key: 'notif.tab.monitorUpdates', Icon: RefreshCw, tone: 'text-[var(--color-info)]' },
};

export function NotificationsList({ notifications }: { notifications: AppNotification[] }) {
  const router = useRouter();
  const [tab, setTab] = React.useState<NotificationType | 'all'>('all');
  const { t } = useI18n();

  const filtered = tab === 'all' ? notifications : notifications.filter((n) => n.type === tab);
  const unread = notifications.filter((n) => !n.is_read).length;

  const open = (n: AppNotification) => {
    void (async () => {
      if (!n.is_read) await markNotificationReadAction(n.id);
      if (n.opportunity_id) router.push(`/app/opportunities?id=${n.opportunity_id}`);
      else if (n.monitor_id) router.push(`/app/monitors?id=${n.monitor_id}`);
      else router.refresh();
    })();
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Notification type">
            {(['all', 'price_drop', 'new_match', 'availability', 'monitor_update'] as const).map((tabKey) => {
              const count = tabKey === 'all' ? notifications.length : notifications.filter((n) => n.type === tabKey).length;
              return (
                <button
                  key={tabKey}
                  role="tab"
                  aria-selected={tab === tabKey}
                  onClick={() => setTab(tabKey)}
                  className={cn(
                    'focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors',
                    tab === tabKey
                      ? 'border-transparent bg-[var(--accent)] text-white'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  {tabKey === 'all' ? t('opp.tab.all') : t(TYPE_META[tabKey].key as never)}
                  <span className={cn('tnum text-[11px]', tab === tabKey ? 'text-white/70' : 'text-[var(--text-muted)]')}>{count}</span>
                </button>
              );
            })}
          </div>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => {
                void markAllReadAction().then((res) => {
                  if (res.ok) {
                    toastSuccess(t('notif.allReadToast'));
                    router.refresh();
                  }
                });
              }}
              className="focus-ring ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <CheckCheck className="size-3.5" aria-hidden /> Mark all as read
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={BellRing} title={t('notif.empty')} description={t('notif.emptyHint')} />
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]" role="list">
            {filtered.map((n) => {
              const meta = TYPE_META[n.type];
              const Icon = meta.Icon;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => open(n)}
                    className={cn(
                      'focus-ring flex w-full items-start gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-[var(--color-surface-subtle)]',
                      !n.is_read && 'bg-[color:var(--color-brand-subtle)]/40'
                    )}
                  >
                    <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--color-surface-subtle)]', meta.tone)}>
                      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={cn('truncate text-[13px]', n.is_read ? 'text-[var(--text-secondary)]' : 'font-semibold text-[var(--text-primary)]')}>
                          {n.title}
                        </span>
                        {!n.is_read && <span className="size-1.5 shrink-0 rounded-full bg-[color:var(--color-brand)]" aria-label={t('notif.unread')} />}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">{n.body}</span>
                      <span className="mt-1 block text-[11px] text-[var(--text-subtle)]">
                        <RelativeTime iso={n.created_at} /> · {t(meta.key as never)}
                      </span>
                    </span>
                    {n.opportunity_id && <Link href={`/app/opportunities?id=${n.opportunity_id}`} className="sr-only">Open opportunity</Link>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
