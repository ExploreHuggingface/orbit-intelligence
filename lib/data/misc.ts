/* Billing (seeded subscriptions — Stripe comes later), profiles, contact,
   video reviews, and misc data access. */
import { getDb, seedForUser } from '@/lib/db';
import { mapPlan, mapProfile, mapSubscription, mapUser, mapVideoReview, type UserRow } from '@/lib/db/rows';
import type { ContactMessage, Plan, PlanCode, Profile, Subscription, VideoReview } from '@/lib/types';
import { hashPassword } from '@/lib/auth/password';
import { randomUUID } from 'node:crypto';

/* --------------------------------- Billing ---------------------------------- */

export function getPlanForUser(userId: string): { plan: Plan; subscription: Subscription } | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT s.user_id, s.plan_code, s.status, s.current_period_end,
              p.code, p.name, p.monitor_limit, p.collection_limit, p.comparison_limit,
              p.price_monthly_eur, p.refresh_label, p.features
       FROM subscriptions s JOIN plans p ON p.code = s.plan_code
       WHERE s.user_id = ?`
    )
    .get(userId) as Record<string, unknown> | undefined;
  if (!row) return null;
  return { plan: mapPlan(row), subscription: mapSubscription(row) };
}

export function getPlanByCode(code: PlanCode): Plan | null {
  const row = getDb().prepare('SELECT * FROM plans WHERE code = ?').get(code) as Record<
    string,
    unknown
  > | undefined;
  return row ? mapPlan(row) : null;
}

export function getAllPlans(): Plan[] {
  return (
    getDb().prepare('SELECT * FROM plans ORDER BY price_monthly_eur ASC').all() as Array<
      Record<string, unknown>
    >
  ).map(mapPlan);
}

/* --------------------------------- Profiles --------------------------------- */

export function getProfile(userId: string): Profile | null {
  const row = getDb().prepare('SELECT * FROM profiles WHERE id = ?').get(userId) as
    | Record<string, unknown>
    | undefined;
  return row ? mapProfile(row) : null;
}

export function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, 'full_name' | 'timezone' | 'onboarded_at' | 'onboarding_step' | 'interests'>>
): Profile | null {
  const db = getDb();
  const existing = getProfile(userId);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  db.prepare(
    `UPDATE profiles SET full_name = ?, timezone = ?, onboarded_at = ?, onboarding_step = ?, interests = ?
     WHERE id = ?`
  ).run(
    merged.full_name,
    merged.timezone,
    merged.onboarded_at,
    merged.onboarding_step,
    JSON.stringify(merged.interests),
    userId
  );
  return getProfile(userId);
}

/* ------------------------------ Users (local auth) --------------------------- */

export interface SignUpInput {
  email: string;
  password: string;
  full_name: string;
}

export function findUserByEmail(email: string): UserRow | null {
  const row = getDb()
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email.trim().toLowerCase()) as Record<string, unknown> | undefined;
  return row ? mapUser(row) : null;
}

export function findUserById(id: string): UserRow | null {
  const row = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapUser(row) : null;
}

/** Create a local user + profile + per-user demo content (idempotent per email). */
export function createUser(input: SignUpInput, planCode: 'free' | 'pro' = 'free'): UserRow {
  const db = getDb();
  const id = `usr-${randomUUID()}`;
  db.prepare(
    'INSERT INTO users (id, email, password_hash, email_confirmed_at) VALUES (?, ?, ?, datetime(\'now\'))'
  ).run(id, input.email.trim().toLowerCase(), hashPassword(input.password));
  db.prepare('INSERT INTO profiles (id, email, full_name) VALUES (?, ?, ?)').run(
    id,
    input.email.trim().toLowerCase(),
    input.full_name.trim()
  );
  seedForUser(db, id, planCode);
  return mapUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown>);
}

/** Import password hash comparison into data layer so actions stay thin. */
export { verifyPassword } from '@/lib/auth/password';

/** Fixed demo account — seeded identically on every serverless instance so the
 *  deployed demo can always be logged into (see README: serverless limits). */
export const DEMO_ACCOUNT = {
  id: 'usr-demo-fixed',
  email: 'demo@orbit.test',
  password: 'orbit-demo-2026',
  name: 'Demo Operator',
} as const;

/** Re-provision a signed-session user on an instance that has never seen them
 *  (ephemeral /tmp database on serverless). Idempotent. */
export function bootstrapUserFromSession(uid: string, email: string, name: string): UserRow | null {
  const db = getDb();
  const existing = findUserByEmail(email);
  if (existing && existing.id !== uid) return null; // email belongs to another account
  db.prepare(
    "INSERT OR IGNORE INTO users (id, email, password_hash, email_confirmed_at) VALUES (?, ?, 'scrypt:bootstrap:unloginable', datetime('now'))"
  ).run(uid, email.trim().toLowerCase());
  db.prepare('INSERT OR IGNORE INTO profiles (id, email, full_name) VALUES (?, ?, ?)').run(
    uid,
    email.trim().toLowerCase(),
    name || email.split('@')[0]
  );
  if (!getPlanForUser(uid)) seedForUser(db, uid, 'pro');
  return findUserById(uid);
}

/* ---------------------------------- Contact ---------------------------------- */

export function insertContactMessage(msg: Omit<ContactMessage, 'id' | 'created_at'>): ContactMessage {
  const db = getDb();
  const id = `msg-${randomUUID().slice(0, 8)}`;
  db.prepare(
    `INSERT INTO contact_messages (id, name, email, company, topic, kind, message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, msg.name, msg.email, msg.company, msg.topic, msg.kind, msg.message);
  const row = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id) as Record<
    string,
    unknown
  >;
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    company: (row.company as string) ?? null,
    topic: String(row.topic),
    kind: String(row.kind),
    message: String(row.message),
    created_at: String(row.created_at),
  };
}

/* -------------------------------- Video reviews ------------------------------- */

export function listVideoReviews(userId: string, category?: VideoReview['category'] | 'all'): VideoReview[] {
  const db = getDb();
  const where =
    category && category !== 'all'
      ? '(user_id IS NULL OR user_id = ?) AND category = ?'
      : '(user_id IS NULL OR user_id = ?)';
  const rows = (
    category && category !== 'all'
      ? db.prepare(`SELECT * FROM video_reviews WHERE ${where} ORDER BY created_at DESC`).all(userId, category)
      : db.prepare(`SELECT * FROM video_reviews WHERE ${where} ORDER BY created_at DESC`).all(userId)
  ) as Array<Record<string, unknown>>;
  return rows.map(mapVideoReview);
}

/* ----------------------------- Settings: data reset --------------------------- */

export function resetDemoData(userId: string): void {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM monitors WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM notifications WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM activity_events WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM collection_items WHERE collection_id IN (SELECT id FROM collections WHERE user_id = ?)').run(userId);
    db.prepare('DELETE FROM collections WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM searches WHERE user_id = ?').run(userId);
    db.prepare(`UPDATE opportunities SET status = 'new', is_interesting = 0 WHERE user_id = ?`).run(userId);
  });
  tx();
  seedForUser(db, userId, 'pro');
}
