/* Row mappers: SQLite rows → domain types (lib/types.ts). */
import type { Db } from './index';
import type {
  ActivityEvent,
  ActivityKind,
  AppNotification,
  Category,
  Collection,
  Monitor,
  MonitorSensitivity,
  NotificationType,
  Opportunity,
  OpportunityStatus,
  Plan,
  PlanCode,
  PriceHistoryPoint,
  Profile,
  RealEstateAttributes,
  Subscription,
  VideoReview,
} from '@/lib/types';

type Row = Record<string, unknown>;

const str = (v: unknown): string => (v == null ? '' : String(v));
const strOrNull = (v: unknown): string | null => (v == null ? null : String(v));
const num = (v: unknown): number => (v == null ? 0 : Number(v));
const numOrNull = (v: unknown): number | null => (v == null ? null : Number(v));
const bool = (v: unknown): boolean => Number(v) === 1;
const json = <T,>(v: unknown, fallback: T): T => {
  if (v == null) return fallback;
  try {
    return JSON.parse(String(v)) as T;
  } catch {
    return fallback;
  }
};

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export const mapUser = (r: Row): UserRow => ({
  id: str(r.id),
  email: str(r.email),
  password_hash: str(r.password_hash),
  created_at: str(r.created_at),
});

export const mapProfile = (r: Row): Profile => ({
  id: str(r.id),
  email: str(r.email),
  full_name: str(r.full_name),
  avatar_url: strOrNull(r.avatar_url),
  timezone: str(r.timezone) || 'Europe/Berlin',
  onboarded_at: strOrNull(r.onboarded_at),
  onboarding_step: num(r.onboarding_step),
  interests: json<string[]>(r.interests, []),
  created_at: str(r.created_at),
});

export const mapPlan = (r: Row): Plan => ({
  code: str(r.code) as PlanCode,
  name: str(r.name),
  monitor_limit: num(r.monitor_limit),
  collection_limit: num(r.collection_limit),
  comparison_limit: num(r.comparison_limit),
  price_monthly_eur: num(r.price_monthly_eur),
  refresh_label: str(r.refresh_label),
  features: json<string[]>(r.features, []),
});

export const mapSubscription = (r: Row): Subscription => ({
  user_id: str(r.user_id),
  plan_code: str(r.plan_code) as PlanCode,
  status: str(r.status) as Subscription['status'],
  current_period_end: str(r.current_period_end),
});

export const mapOpportunity = (r: Row): Opportunity => ({
  id: str(r.id),
  user_id: strOrNull(r.user_id),
  title: str(r.title),
  description: str(r.description),
  category: str(r.category) as Category,
  image_url: strOrNull(r.image_url),
  source_marketplace: str(r.source_marketplace),
  source_url: str(r.source_url),
  current_price: num(r.current_price),
  currency: str(r.currency) || 'EUR',
  previous_price: numOrNull(r.previous_price),
  estimated_market_value: numOrNull(r.estimated_market_value),
  price_change_pct: numOrNull(r.price_change_pct),
  deal_score: num(r.deal_score),
  match_score: num(r.match_score),
  status: str(r.status) as OpportunityStatus,
  discovered_at: str(r.discovered_at),
  last_checked_at: str(r.last_checked_at),
  is_sample: bool(r.is_sample),
  is_interesting: bool(r.is_interesting),
  attributes: json(r.attributes, {}),
  real_estate: json<RealEstateAttributes | null>(r.real_estate, null),
  evidence_links: json<string[]>(r.evidence_links, []),
});

export const mapMonitor = (r: Row): Monitor => ({
  id: str(r.id),
  user_id: str(r.user_id),
  name: str(r.name),
  description: str(r.description),
  category: str(r.category) as Category,
  criteria: json(r.criteria, { keywords: [], excluded_terms: [], required_attributes: {} }),
  sensitivity: str(r.sensitivity) as MonitorSensitivity,
  frequency_minutes: num(r.frequency_minutes),
  notify_in_app: bool(r.notify_in_app),
  notify_email: bool(r.notify_email),
  digest_mode: bool(r.digest_mode),
  price_drop_only: bool(r.price_drop_only),
  status: str(r.status) as Monitor['status'],
  match_count: num(r.match_count),
  last_checked_at: str(r.last_checked_at),
  created_at: str(r.created_at),
});

export const mapCollection = (r: Row): Collection => ({
  id: str(r.id),
  user_id: str(r.user_id),
  name: str(r.name),
  created_at: str(r.created_at),
  item_count: num(r.item_count),
});

export const mapNotification = (r: Row): AppNotification => ({
  id: str(r.id),
  user_id: str(r.user_id),
  type: str(r.type) as NotificationType,
  title: str(r.title),
  body: str(r.body),
  opportunity_id: strOrNull(r.opportunity_id),
  monitor_id: strOrNull(r.monitor_id),
  is_read: bool(r.is_read),
  created_at: str(r.created_at),
});

export const mapActivity = (r: Row): ActivityEvent => ({
  id: str(r.id),
  user_id: str(r.user_id),
  kind: str(r.kind) as ActivityKind,
  payload: json(r.payload, {}),
  created_at: str(r.created_at),
});

export const mapVideoReview = (r: Row): VideoReview => ({
  id: str(r.id),
  user_id: strOrNull(r.user_id),
  title: str(r.title),
  source: str(r.source),
  source_url: str(r.source_url),
  duration: str(r.duration),
  opportunity_id: strOrNull(r.opportunity_id),
  category: str(r.category) as Category,
  is_sample: bool(r.is_sample),
  created_at: str(r.created_at),
});

export function getHistory(db: Db, opportunityId: string): PriceHistoryPoint[] {
  const rows = db
    .prepare('SELECT date, price FROM price_history WHERE opportunity_id = ? ORDER BY date ASC, rowid ASC')
    .all(opportunityId) as Array<Row>;
  // Dedupe by date keeping the LAST observation (seeding appends today's
  // explicit price after any generated point for the same day).
  const byDate = new Map<string, PriceHistoryPoint>();
  for (const r of rows) byDate.set(str(r.date).slice(0, 10), { date: str(r.date).slice(0, 10), price: num(r.price) });
  return Array.from(byDate.values());
}
