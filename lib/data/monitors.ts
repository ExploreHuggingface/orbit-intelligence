/* Monitors data access. */
import { getDb } from '@/lib/db';
import { mapMonitor } from '@/lib/db/rows';
import type { Monitor, Category, MonitorSensitivity } from '@/lib/types';
import { randomUUID } from 'node:crypto';

export interface MonitorInput {
  name: string;
  description: string;
  category: Category;
  criteria: Monitor['criteria'];
  sensitivity: MonitorSensitivity;
  frequency_minutes: number;
  notify_in_app: boolean;
  notify_email: boolean;
  digest_mode: boolean;
  price_drop_only: boolean;
}

export function listMonitors(userId: string, opts?: { status?: Monitor['status']; sort?: 'name' | 'matches' | 'checked' }): Monitor[] {
  const db = getDb();
  const params: Record<string, unknown> = { userId };
  let sql = 'SELECT * FROM monitors WHERE user_id = @userId';
  if (opts?.status) {
    sql += ' AND status = @status';
    params.status = opts.status;
  }
  sql += ' ORDER BY ';
  switch (opts?.sort) {
    case 'name': sql += 'name COLLATE NOCASE'; break;
    case 'matches': sql += 'match_count DESC'; break;
    case 'checked': sql += 'last_checked_at DESC'; break;
    default: sql += 'created_at DESC';
  }
  return (db.prepare(sql).all(params) as Array<Record<string, unknown>>).map(mapMonitor);
}

export function getMonitorById(userId: string, id: string): Monitor | null {
  const row = getDb()
    .prepare('SELECT * FROM monitors WHERE id = ? AND user_id = ?')
    .get(id, userId) as Record<string, unknown> | undefined;
  return row ? mapMonitor(row) : null;
}

export function countActiveMonitors(userId: string): number {
  return (
    getDb()
      .prepare(`SELECT COUNT(*) AS n FROM monitors WHERE user_id = ? AND status = 'active'`)
      .get(userId) as { n: number }
  ).n;
}

export function createMonitor(userId: string, input: MonitorInput): Monitor {
  const db = getDb();
  const id = `mon-${randomUUID().slice(0, 8)}`;
  db.prepare(
    `INSERT INTO monitors (id, user_id, name, description, category, criteria, sensitivity, frequency_minutes,
      notify_in_app, notify_email, digest_mode, price_drop_only, status, match_count, last_checked_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, datetime('now'), datetime('now'))`
  ).run(
    id,
    userId,
    input.name,
    input.description,
    input.category,
    JSON.stringify(input.criteria),
    input.sensitivity,
    input.frequency_minutes,
    input.notify_in_app ? 1 : 0,
    input.notify_email ? 1 : 0,
    input.digest_mode ? 1 : 0,
    input.price_drop_only ? 1 : 0
  );
  return getMonitorById(userId, id)!;
}

export function updateMonitor(userId: string, id: string, input: Partial<MonitorInput> & { status?: Monitor['status'] }): Monitor | null {
  const db = getDb();
  const existing = getMonitorById(userId, id);
  if (!existing) return null;
  const merged = { ...existing, ...input, criteria: input.criteria ?? existing.criteria };
  db.prepare(
    `UPDATE monitors SET name = ?, description = ?, category = ?, criteria = ?, sensitivity = ?,
      frequency_minutes = ?, notify_in_app = ?, notify_email = ?, digest_mode = ?, price_drop_only = ?, status = ?
     WHERE id = ? AND user_id = ?`
  ).run(
    merged.name,
    merged.description,
    merged.category,
    JSON.stringify(merged.criteria),
    merged.sensitivity,
    merged.frequency_minutes,
    merged.notify_in_app ? 1 : 0,
    merged.notify_email ? 1 : 0,
    merged.digest_mode ? 1 : 0,
    merged.price_drop_only ? 1 : 0,
    merged.status,
    id,
    userId
  );
  return getMonitorById(userId, id);
}

export function setMonitorStatus(userId: string, id: string, status: Monitor['status']): boolean {
  const r = getDb()
    .prepare('UPDATE monitors SET status = ? WHERE id = ? AND user_id = ?')
    .run(status, id, userId);
  return r.changes > 0;
}

export function deleteMonitor(userId: string, id: string): Monitor | null {
  const db = getDb();
  const existing = getMonitorById(userId, id);
  if (!existing) return null;
  db.prepare('DELETE FROM monitors WHERE id = ? AND user_id = ?').run(id, userId);
  return existing;
}
