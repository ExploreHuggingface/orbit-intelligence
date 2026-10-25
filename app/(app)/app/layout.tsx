import { requireUser } from '@/lib/auth/server';
import { countUnread, listNotifications } from '@/lib/data/activity';
import { countActiveMonitors } from '@/lib/data/monitors';
import { getPlanForUser } from '@/lib/data/misc';
import { AppSidebar } from '@/components/app/shell/app-sidebar';
import { Topbar, type BellNotification } from '@/components/app/shell/topbar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const billing = getPlanForUser(user.id);
  const plan = billing?.plan;
  const unread = countUnread(user.id);
  const recent = listNotifications(user.id, { limit: 5 });

  const bellNotifications: BellNotification[] = recent.map((n) => ({
    id: n.id,
    title: n.title,
    created_at: n.created_at,
    is_read: n.is_read,
    href: n.opportunity_id
      ? `/app/opportunities?id=${n.opportunity_id}`
      : n.monitor_id
        ? '/app/monitors'
        : '/app/notifications',
  }));

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-canvas)]">
      <AppSidebar
        unreadCount={unread}
        monitorsUsed={countActiveMonitors(user.id)}
        monitorsLimit={plan?.monitor_limit ?? 3}
        planName={plan?.name ?? 'Free'}
        fullName={user.profile.full_name}
        email={user.email}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar notifications={bellNotifications} />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
