import { requireUser } from '@/lib/auth/server';
import { listNotifications } from '@/lib/data/activity';
import { NotificationsList } from '@/components/app/notifications-list';

export const metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const user = await requireUser('/app/notifications');
  const notifications = listNotifications(user.id, { limit: 100 });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Notifications</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Match alerts, price drops, availability changes and monitor updates. Clicking a row marks it read and opens the record.
        </p>
      </div>
      <NotificationsList notifications={notifications} />
    </div>
  );
}
