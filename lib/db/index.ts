/* ============================================================================
   Local SQLite backend (better-sqlite3).
   The file-backed database lives in .orbit-local/orbit.db (gitignored).
   Tables mirror the Supabase schema in supabase/migrations — the production
   path swaps this module for @supabase/ssr without touching lib/data/*.
   ========================================================================== */

import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import type BetterSqlite3 from 'better-sqlite3';
import { seedGlobals, seedUserContent } from './seed';

export type Db = BetterSqlite3.Database;

// Vercel serverless: the working directory is read-only — /tmp is the only
// writable location. The database is ephemeral there (resets on cold starts);
// set the Supabase env vars for durable production storage.
const IS_VERCEL = Boolean(process.env.VERCEL);
// Pinned per deployment: warm lambdas must never reuse a /tmp database written
// by an older build (schema/seed drift). Instances within a deployment each
// still own their ephemeral file; session-claims bootstrap handles that.
const DATA_DIR = IS_VERCEL
  ? `/tmp/orbit-${process.env.VERCEL_DEPLOYMENT_ID ?? 'dev'}`
  : join(process.cwd(), '.orbit-local');
const DB_PATH = join(DATA_DIR, 'orbit.db');

declare global {
  var __orbitDb: Db | undefined;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_confirmed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
  onboarded_at TEXT,
  onboarding_step INTEGER NOT NULL DEFAULT 0,
  interests TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plans (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monitor_limit INTEGER NOT NULL,
  collection_limit INTEGER NOT NULL,
  comparison_limit INTEGER NOT NULL,
  price_monthly_eur REAL NOT NULL DEFAULT 0,
  refresh_label TEXT NOT NULL,
  features TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS subscriptions (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL REFERENCES plans(code),
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  image_url TEXT,
  source_marketplace TEXT NOT NULL,
  source_url TEXT NOT NULL,
  current_price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  previous_price REAL,
  estimated_market_value REAL,
  price_change_pct REAL,
  deal_score INTEGER NOT NULL DEFAULT 0,
  match_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  discovered_at TEXT NOT NULL,
  last_checked_at TEXT NOT NULL,
  is_sample INTEGER NOT NULL DEFAULT 0,
  is_interesting INTEGER NOT NULL DEFAULT 0,
  attributes TEXT NOT NULL DEFAULT '{}',
  real_estate TEXT,
  evidence_links TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_opp_user_status ON opportunities(user_id, status);
CREATE INDEX IF NOT EXISTS idx_opp_category ON opportunities(category);

CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  price REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_history_opp ON price_history(opportunity_id);

CREATE TABLE IF NOT EXISTS monitors (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  criteria TEXT NOT NULL DEFAULT '{}',
  sensitivity TEXT NOT NULL DEFAULT 'balanced',
  frequency_minutes INTEGER NOT NULL DEFAULT 30,
  notify_in_app INTEGER NOT NULL DEFAULT 1,
  notify_email INTEGER NOT NULL DEFAULT 0,
  digest_mode INTEGER NOT NULL DEFAULT 0,
  price_drop_only INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  match_count INTEGER NOT NULL DEFAULT 0,
  last_checked_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS collection_items (
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (collection_id, opportunity_id)
);

CREATE TABLE IF NOT EXISTS comparisons (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_ids TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  opportunity_id TEXT REFERENCES opportunities(id) ON DELETE SET NULL,
  monitor_id TEXT REFERENCES monitors(id) ON DELETE SET NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS activity_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  category TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  topic TEXT NOT NULL DEFAULT 'support',
  kind TEXT NOT NULL DEFAULT 'contact',
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS video_reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  duration TEXT NOT NULL,
  opportunity_id TEXT,
  category TEXT NOT NULL,
  is_sample INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export function getDb(): Db {
  if (globalThis.__orbitDb) return globalThis.__orbitDb;
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  globalThis.__orbitDb = db;

  // Seed plans + global sample content on first run (idempotent).
  const plansCount = (db.prepare('SELECT COUNT(*) AS n FROM plans').get() as { n: number }).n;
  if (plansCount === 0) {
    seedGlobals(db);
    console.log('[orbit] local database seeded with demo content');
  }
  return db;
}

/** Per-user demo content, created on signup so every page has data on first login. */
export { seedUserContent as seedForUser } from './seed';
