'use client';

/* Topbar: mobile nav trigger, breadcrumb, page actions, notification bell,
   New Monitor button (plan §24). */
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, PanelLeft } from 'lucide-react';
import { NotificationBell, type Notification } from '@/components/easyui/NotificationBell';
import { markNotificationReadAction, markAllReadAction } from '@/lib/actions/app';
import { useUiStore } from '@/lib/stores/ui-store';
import { navItemForPath } from '@/components/app/nav';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useI18n } from '@/lib/i18n/context';

export interface BellNotification {
  id: string;
  title: string;
  created_at: string;
  is_read: boolean;
  href: string | null;
}

export function Topbar({
  notifications,
  pageAction,
}: {
  notifications: BellNotification[];
  pageAction?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const active = navItemForPath(pathname ?? '/app/overview');
  const { t, locale } = useI18n();
  const activeLabel = locale === 'en' ? active.label : t(active.key);

  const items: Notification[] = notifications.map((n) => ({
    id: n.id,
    message: n.title,
    timestamp: n.created_at,
    read: n.is_read,
    action: n.href
      ? () => {
          void (async () => {
            await markNotificationReadAction(n.id);
            router.push(n.href!);
          })();
        }
      : undefined,
  }));

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
          className="grid size-9 place-items-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] md:hidden"
        >
          <PanelLeft className="size-[18px]" strokeWidth={1.75} />
        </button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
          <Link href="/app/overview" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            {t('nav.workspace')}
          </Link>
          <span className="text-[var(--text-subtle)]" aria-hidden>
            /
          </span>
          <span className="truncate font-medium text-[var(--text-primary)]">{activeLabel}</span>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {pageAction}
        <LanguageSelector className="hidden sm:block" />
        <div className="relative">
          <NotificationBell
            notifications={items}
            onMarkAsRead={(id) => void markNotificationReadAction(id)}
            onMarkAllAsRead={() => void markAllReadAction()}
            footer={
              <Link
                href="/app/notifications"
                className="text-xs font-medium text-[color:var(--color-brand)] hover:underline"
                onClick={() => router.push('/app/notifications')}
              >
                {t('notif.viewAll')}
              </Link>
            }
          />
        </div>
        <Link
          href="/app/monitors?new=1"
          className="focus-ring hidden h-9 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 text-sm font-medium text-white hover:opacity-90 sm:inline-flex"
        >
          <Plus className="size-4" strokeWidth={2} aria-hidden />
          {t('nav.newMonitor')}
        </Link>
      </div>
    </header>
  );
}
