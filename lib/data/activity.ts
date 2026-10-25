/* Notifications + activity data access. */
import { getDb } from '@/lib/db';
import { mapActivity, mapNotification } from '@/lib/db/rows';
import type { ActivityEvent, ActivityKind, AppNotification, NotificationType } from '@/lib/types';
import { randomUUID } from 'node:crypto';

export function listNotifications(
  userId: string,
  opts?: { type?: NotificationType | 'all'; unreadOnly?: boolean; limit?: number }
): AppNotification[] {
  const db = getDb();
  const clauses = ['user_id = @uid'];
  if (opts?.type && opts.type !== 'all') clauses.push('type = @type');
  if (opts?.unreadOnly) clauses.push('is_read = 0');
  const rows = db
    .prepare(
      `SELECT * FROM notifications WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT @limit`
    )
    .all({ uid: userId, type: opts?.type ?? 'all', limit: opts?.limit ?? 100 }) as Array<
    Record<string, unknown>
  >;
  return rows.map(mapNotification);
}

export function countUnread(userId: string): number {
  return (
    getDb()
      .prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0')
      .get(userId) as { n: number }
  ).n;
}

export function markNotificationRead(userId: string, id: string): boolean {
  return (
    getDb()
      .prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
      .run(id, userId).changes > 0
  );
}

export function markAllNotificationsRead(userId: string): number {
  return getDb()
    .prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0')
    .run(userId).changes;
}

export function getNotificationById(userId: string, id: string): AppNotification | null {
  const row = getDb()
    .prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?')
    .get(id, userId) as Record<string, unknown> | undefined;
  return row ? mapNotification(row) : null;
}

/* ---------------------------------- Activity -------------------------------- */

export function listActivity(
  userId: string,
  opts?: { kind?: ActivityKind | 'all'; q?: string; limit?: number }
): ActivityEvent[] {
  const db = getDb();
  const clauses = ['user_id = @uid'];
  if (opts?.kind && opts.kind !== 'all') clauses.push('kind = @kind');
  if (opts?.q) clauses.push('(payload LIKE @q OR kind LIKE @q)');
  const rows = db
    .prepare(
      `SELECT * FROM activity_events WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT @limit`
    )
    .all({ uid: userId, kind: opts?.kind ?? 'all', q: opts?.q ? `%${opts.q}%` : undefined, limit: opts?.limit ?? 100 }) as Array<Record<string, unknown>>;
  return rows.map(mapActivity);
}

export function logActivity(userId: string, kind: ActivityKind, payload: Record<string, unknown>): void {
  getDb()
    .prepare('INSERT INTO activity_events (id, user_id, kind, payload) VALUES (?, ?, ?, ?)')
    .run(`act-${randomUUID().slice(0, 8)}`, userId, kind, JSON.stringify(payload));
}
