/* ============================================================================
   ORBIT Intelligence — shared domain types (plan §7 schema mirrored 1:1).
   These shapes are the stable service contract (plan §6/§8): the same types
   are returned by the local SQLite backend today and the Supabase backend
   in production.
   ========================================================================== */

export const CATEGORIES = [
  'real_estate',
  'watches',
  'cars_parts',
  'electronics',
  'home_living',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  real_estate: 'Real Estate',
  watches: 'Watches',
  cars_parts: 'Cars & Parts',
  electronics: 'Electronics',
  home_living: 'Home & Living',
};

export const OPPORTUNITY_STATUSES = [
  'new',
  'shortlisted',
  'under_review',
  'dismissed',
  'purchased',
  'completed',
] as const;

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const STATUS_LABELS: Record<OpportunityStatus, string> = {
  new: 'New',
  shortlisted: 'Shortlisted',
  under_review: 'Under Review',
  dismissed: 'Dismissed',
  purchased: 'Purchased',
  completed: 'Completed',
};

export const MONITOR_SENSITIVITIES = ['broad', 'balanced', 'strict'] as const;
export type MonitorSensitivity = (typeof MONITOR_SENSITIVITIES)[number];

export const NOTIFICATION_TYPES = [
  'price_drop',
  'new_match',
  'availability',
  'monitor_update',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const PLAN_CODES = ['free', 'pro', 'scale'] as const;
export type PlanCode = (typeof PLAN_CODES)[number];

/* ---------------------------------- Records --------------------------------- */

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  timezone: string;
  onboarded_at: string | null;
  onboarding_step: number;
  interests: string[];
  created_at: string;
}

export interface Plan {
  code: PlanCode;
  name: string;
  monitor_limit: number; // -1 = unlimited
  collection_limit: number;
  comparison_limit: number;
  price_monthly_eur: number;
  refresh_label: string;
  features: string[];
}

export interface Subscription {
  user_id: string;
  plan_code: PlanCode;
  status: 'active' | 'trialing' | 'canceled';
  current_period_end: string;
}

export interface RealEstateAttributes {
  city: string;
  neighborhood: string;
  property_type: string;
  bedrooms: number;
  area_m2: number;
  year_built: number;
  est_rent_monthly: number;
  gross_yield_pct: number;
  expenses_monthly: number;
  net_yield_pct: number;
}

export interface Opportunity {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  category: Category;
  image_url: string | null;
  source_marketplace: string;
  source_url: string;
  current_price: number;
  currency: string;
  previous_price: number | null;
  estimated_market_value: number | null;
  price_change_pct: number | null;
  deal_score: number;
  match_score: number;
  status: OpportunityStatus;
  discovered_at: string;
  last_checked_at: string;
  is_sample: boolean;
  is_interesting: boolean;
  attributes: Record<string, string | number | boolean>;
  real_estate: RealEstateAttributes | null;
  evidence_links: string[];
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  event?: string;
}

export interface Monitor {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: Category;
  criteria: {
    price_min?: number;
    price_max?: number;
    keywords: string[];
    excluded_terms: string[];
    required_attributes: Record<string, string>;
    domain_restriction?: string;
  };
  sensitivity: MonitorSensitivity;
  frequency_minutes: number;
  notify_in_app: boolean;
  notify_email: boolean;
  digest_mode: boolean;
  price_drop_only: boolean;
  status: 'active' | 'paused';
  match_count: number;
  last_checked_at: string;
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  item_count?: number;
}

export interface CollectionItem {
  collection_id: string;
  opportunity_id: string;
  added_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  opportunity_id: string | null;
  monitor_id: string | null;
  is_read: boolean;
  created_at: string;
}

export type ActivityKind =
  | 'monitor_created'
  | 'monitor_paused'
  | 'monitor_resumed'
  | 'monitor_deleted'
  | 'monitor_updated'
  | 'status_changed'
  | 'bulk_status_changed'
  | 'added_to_collection'
  | 'removed_from_collection'
  | 'collection_created'
  | 'search_saved'
  | 'notification_read'
  | 'profile_updated'
  | 'settings_updated'
  | 'data_reset';

export interface ActivityEvent {
  id: string;
  user_id: string;
  kind: ActivityKind;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface SearchRecord {
  id: string;
  user_id: string;
  query: string;
  category: Category | null;
  created_at: string;
}

export interface VideoReview {
  id: string;
  user_id: string | null;
  title: string;
  source: string;
  source_url: string;
  duration: string;
  opportunity_id: string | null;
  category: Category;
  is_sample: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company: string | null;
  topic: string;
  kind: string;
  message: string;
  created_at: string;
}

/* ------------------------------- Query helpers ------------------------------ */

export interface OpportunityFilters {
  q?: string;
  category?: Category | 'all';
  status?: OpportunityStatus | 'all';
  city?: string[];
  neighborhoods?: string[];
  price_min?: number;
  price_max?: number;
  property_type?: string;
  bedrooms_min?: number;
  yield_min?: number;
  price_per_m2_max?: number;
  brand?: string[];
  condition?: string;
  marketplaces?: string[];
  price_drop_only?: boolean;
  min_match_score?: number;
  sort?: 'newest' | 'lowest_price' | 'highest_deal_score' | 'biggest_price_drop' | 'best_match';
  page?: number;
  per_page?: number;
}

export interface Paginated<T> {
  rows: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/* --------------------------------- Analytics -------------------------------- */

export interface Kpis {
  active_monitors: number;
  monitor_limit: number;
  matching_opportunities: number;
  price_drops_detected: number;
  estimated_savings: number;
  monitors_trend: number;
  opportunities_trend: number;
  price_drops_trend: number;
  savings_trend: number;
  spark_monitors: number[];
  spark_opportunities: number[];
  spark_price_drops: number[];
  spark_savings: number[];
}

export interface DiscoveriesPoint {
  date: string;
  count: number;
}

export interface CategoryPriceDrop {
  category: Category;
  drops: number;
}

export interface DealScoreDistribution {
  bucket: string;
  count: number;
}

export interface MarketVsListing {
  category: Category;
  avg_listing: number;
  avg_market: number;
}
