/* Recent Activity timeline (plan §25.7) — server-rendered, presentational. */
import Link from 'next/link';
import {
  BookmarkPlus,
  FolderPlus,
  History,
  Radar,
  RotateCcw,
  Search,
  Settings2,
  ShoppingCart,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { RelativeTime } from '@/components/ui/atoms';
import type { ActivityEvent, ActivityKind } from '@/lib/types';

const KIND_META: Record<ActivityKind, { icon: LucideIcon; label: string; tone: string }> = {
  monitor_created: { icon: Radar, label: 'created monitor', tone: 'text-[color:var(--color-brand)]' },
  monitor_paused: { icon: History, label: 'paused monitor', tone: 'text-[var(--color-warning)]' },
  monitor_resumed: { icon: RotateCcw, label: 'resumed monitor', tone: 'text-[color:var(--color-positive)]' },
  monitor_deleted: { icon: Trash2, label: 'deleted monitor', tone: 'text-[var(--color-negative)]' },
  monitor_updated: { icon: Radar, label: 'updated monitor', tone: 'text-[color:var(--color-info)]' },
  status_changed: { icon: ShoppingCart, label: 'changed status', tone: 'text-[color:var(--color-info)]' },
  bulk_status_changed: { icon: ShoppingCart, label: 'bulk status change', tone: 'text-[color:var(--color-info)]' },
  added_to_collection: { icon: BookmarkPlus, label: 'saved to collection', tone: 'text-[color:var(--color-violet)]' },
  removed_from_collection: { icon: BookmarkPlus, label: 'removed from collection', tone: 'text-[var(--color-negative)]' },
  collection_created: { icon: FolderPlus, label: 'created collection', tone: 'text-[color:var(--color-violet)]' },
  search_saved: { icon: Search, label: 'saved search', tone: 'text-[var(--text-secondary)]' },
  notification_read: { icon: History, label: 'read notifications', tone: 'text-[var(--text-secondary)]' },
  profile_updated: { icon: Settings2, label: 'updated profile', tone: 'text-[var(--text-secondary)]' },
  settings_updated: { icon: Settings2, label: 'updated settings', tone: 'text-[var(--text-secondary)]' },
  data_reset: { icon: RotateCcw, label: 'reset demo data', tone: 'text-[var(--color-negative)]' },
};

function describe(kind: ActivityKind, payload: Record<string, unknown>): string {
  const name = typeof payload.name === 'string' ? payload.name : undefined;
  const title = typeof payload.title === 'string' ? payload.title : undefined;
  const collection = typeof payload.collection === 'string' ? payload.collection : undefined;
  const status = typeof payload.status === 'string' ? (payload.status as string).replace(/_/g, ' ') : undefined;
  const query = typeof payload.query === 'string' ? payload.query : undefined;
  const count = typeof payload.count === 'number' ? payload.count : undefined;
  switch (kind) {
    case 'monitor_created':
      return name ? `Monitor “${name}” created and now watching sources` : 'Monitor created';
    case 'monitor_updated':
      return name ? `Monitor “${name}” updated` : 'Monitor updated';
    case 'monitor_paused':
      return name ? `Paused “${name}”` : 'Monitor paused';
    case 'monitor_resumed':
      return name ? `Resumed “${name}”` : 'Monitor resumed';
    case 'monitor_deleted':
      return name ? `Deleted monitor “${name}”` : 'Monitor deleted';
    case 'status_changed':
      return title ? `“${title}” marked as ${status}` : 'Opportunity status changed';
    case 'bulk_status_changed':
      return `${count ?? 'Multiple'} opportunities marked as ${status}`;
    case 'added_to_collection':
      return title ? `“${title}” saved to “${collection}”` : 'Saved to collection';
    case 'removed_from_collection':
      return title ? `“${title}” removed from “${collection}”` : 'Removed from collection';
    case 'collection_created':
      return name ? `Collection “${name}” created` : 'Collection created';
    case 'search_saved':
      return query ? `Saved search “${query}”` : 'Search saved';
    case 'profile_updated':
      return 'Profile updated';
    case 'settings_updated':
      return 'Settings updated';
    case 'data_reset':
      return 'Demo data was reset to its original state';
    case 'notification_read':
      return 'Notifications marked as read';
    default:
      return String(kind).replace(/_/g, " ");
  }
}

export function ActivityTimeline({ events, compact = false }: { events: ActivityEvent[]; compact?: boolean }) {
  if (events.length === 0) {
    return (
      <EmptyState icon={History} title="No activity yet" description="Your actions and monitor events will appear here." />
    );
  }
  return (
    <ol className={compact ? 'space-y-0.5' : 'space-y-1'} aria-label="Recent activity">
      {events.map((e) => {
        const meta = KIND_META[e.kind] ?? { icon: History, label: e.kind, tone: 'text-[var(--text-secondary)]' };
        const Icon = meta.icon;
        const linkToMonitor = e.kind.startsWith('monitor_') && typeof e.payload.id === 'string';
        return (
          <li key={e.id} className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-[var(--color-surface-subtle)]">
            <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--color-surface-subtle)] ${meta.tone}`}>
              <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-snug text-[var(--text-secondary)]">
                {linkToMonitor ? (
                  <Link href={`/app/monitors?id=${e.payload.id}`} className="focus-ring rounded font-medium text-[var(--text-primary)] hover:underline">
                    {describe(e.kind, e.payload)}
                  </Link>
                ) : (
                  <span className="text-[var(--text-primary)]">{describe(e.kind, e.payload)}</span>
                )}
              </p>
              {!compact && (
                <p className="mt-0.5 text-[11px] capitalize text-[var(--text-muted)]">
                  {meta.label} · <RelativeTime iso={e.created_at} />
                </p>
              )}
            </div>
            {compact && <RelativeTime iso={e.created_at} className="shrink-0 text-[11px]" />}
          </li>
        );
      })}
    </ol>
  );
}

export function ActivityCard({ events }: { events: ActivityEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <Link href="/app/activity" className="focus-ring rounded text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          View all →
        </Link>
      </CardHeader>
      <CardContent className="p-2">
        <ActivityTimeline events={events.slice(0, 8)} />
      </CardContent>
    </Card>
  );
}
