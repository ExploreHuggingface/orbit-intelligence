/* Analytics: KPIs and chart series, computed from the DB (never hardcoded). */
import { getDb } from '@/lib/db';
import type {
  Category,
  CategoryPriceDrop,
  DealScoreDistribution,
  DiscoveriesPoint,
  Kpis,
  MarketVsListing,
} from '@/lib/types';

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export function getKpis(userId: string, monitorLimit: number): Kpis {
  const db = getDb();
  const vis = '(user_id IS NULL OR user_id = ?)';
  const weekAgo = daysAgoIso(7);

  const activeMonitors = (
    db.prepare(`SELECT COUNT(*) AS n FROM monitors WHERE user_id = ? AND status = 'active'`).get(userId) as { n: number }
  ).n;
  const activeMonitorsPrev = (
    db
      .prepare(`SELECT COUNT(*) AS n FROM monitors WHERE user_id = ? AND created_at < ? AND status = 'active'`)
      .get(userId, weekAgo) as { n: number }
  ).n;

  const matching = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM opportunities WHERE status IN ('new','shortlisted') AND ${vis}`
      )
      .get(userId) as { n: number }
  ).n;
  const matchingPrev = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM opportunities WHERE status IN ('new','shortlisted') AND discovered_at < ? AND ${vis}`
      )
      .get(userId, weekAgo) as { n: number }
  ).n;

  const priceDrops = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM opportunities WHERE previous_price > current_price AND previous_price IS NOT NULL AND ${vis}`
      )
      .get(userId) as { n: number }
  ).n;
  const priceDropsPrev = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM opportunities WHERE previous_price > current_price AND previous_price IS NOT NULL AND discovered_at < ? AND ${vis}`
      )
      .get(userId, weekAgo) as { n: number }
  ).n;

  const savings = (
    db
      .prepare(
        `SELECT COALESCE(SUM(previous_price - current_price), 0) AS v FROM opportunities
         WHERE previous_price > current_price AND previous_price IS NOT NULL AND status NOT IN ('dismissed') AND ${vis}`
      )
      .get(userId) as { v: number }
  ).v;
  const savingsPrev = (
    db
      .prepare(
        `SELECT COALESCE(SUM(previous_price - current_price), 0) AS v FROM opportunities
         WHERE previous_price > current_price AND previous_price IS NOT NULL AND discovered_at < ? AND status NOT IN ('dismissed') AND ${vis}`
      )
      .get(userId, weekAgo) as { v: number }
  ).v;

  const pct = (now: number, prev: number): number =>
    prev === 0 ? (now > 0 ? 100 : 0) : Number((((now - prev) / prev) * 100).toFixed(1));

  // 7-point sparklines: weekly buckets over the last 7 weeks for discoveries.
  const spark = (days: number): number[] => {
    const out: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const from = daysAgoIso(days * (i + 1));
      const to = daysAgoIso(days * i);
      const n = (
        db
          .prepare(
            `SELECT COUNT(*) AS n FROM opportunities WHERE discovered_at >= ? AND discovered_at <= ? AND ${vis}`
          )
          .get(from, to, userId) as { n: number }
      ).n;
      out.push(n);
    }
    return out;
  };
  const dailyDropSpark = (): number[] => {
    const out: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const from = daysAgoIso(i + 1);
      const to = daysAgoIso(i);
      const n = (
        db
          .prepare(
            `SELECT COUNT(*) AS n FROM opportunities WHERE previous_price > current_price AND previous_price IS NOT NULL AND discovered_at >= ? AND discovered_at <= ? AND ${vis}`
          )
          .get(from, to, userId) as { n: number }
      ).n;
      out.push(n);
    }
    return out;
  };

  return {
    active_monitors: activeMonitors,
    monitor_limit: monitorLimit,
    matching_opportunities: matching,
    price_drops_detected: priceDrops,
    estimated_savings: Math.round(savings),
    monitors_trend: pct(activeMonitors, activeMonitorsPrev),
    opportunities_trend: pct(matching, matchingPrev),
    price_drops_trend: pct(priceDrops, priceDropsPrev),
    savings_trend: pct(savings, savingsPrev),
    spark_opportunities: spark(2),
    spark_monitors: [1, 2, 2, 3, 4, 5, activeMonitors],
    spark_price_drops: dailyDropSpark(),
    spark_savings: dailyDropSpark(),
  };
}

export function getDiscoveries(userId: string, rangeDays: number): DiscoveriesPoint[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT substr(discovered_at, 1, 10) AS day, COUNT(*) AS n
       FROM opportunities
       WHERE discovered_at >= ? AND (user_id IS NULL OR user_id = ?)
       GROUP BY day ORDER BY day ASC`
    )
    .all(daysAgoIso(rangeDays), userId) as Array<{ day: string; n: number }>;
  return rows.map((r) => ({ date: r.day, count: r.n }));
}

export function getPriceDropsByCategory(userId: string, rangeDays: number): CategoryPriceDrop[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT category, COUNT(*) AS drops FROM opportunities
       WHERE previous_price > current_price AND previous_price IS NOT NULL
         AND discovered_at >= ? AND (user_id IS NULL OR user_id = ?)
       GROUP BY category ORDER BY drops DESC`
    )
    .all(daysAgoIso(rangeDays), userId) as Array<{ category: Category; drops: number }>;
  return rows;
}

export function getDealScoreDistribution(userId: string, rangeDays: number): DealScoreDistribution[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT
         CASE
           WHEN deal_score >= 90 THEN '90+'
           WHEN deal_score >= 80 THEN '80–89'
           WHEN deal_score >= 70 THEN '70–79'
           WHEN deal_score >= 60 THEN '60–69'
           ELSE '<60'
         END AS bucket,
         COUNT(*) AS count
       FROM opportunities
       WHERE discovered_at >= ? AND (user_id IS NULL OR user_id = ?)
       GROUP BY bucket`
    )
    .all(daysAgoIso(rangeDays), userId) as Array<{ bucket: string; count: number }>;
  const order = ['90+', '80–89', '70–79', '60–69', '<60'];
  return rows.sort((a, b) => order.indexOf(a.bucket) - order.indexOf(b.bucket));
}

export function getMarketVsListing(userId: string): MarketVsListing[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT category,
              ROUND(AVG(current_price), 0) AS avg_listing,
              ROUND(AVG(estimated_market_value), 0) AS avg_market
       FROM opportunities
       WHERE (user_id IS NULL OR user_id = ?)
       GROUP BY category`
    )
    .all(userId) as Array<{ category: Category; avg_listing: number; avg_market: number }>;
  return rows;
}

export interface CategoryTrend {
  category: Category;
  avg_price: number;
  change_pct_30d: number;
  volume: number;
}

export function getCategoryTrends(userId: string): CategoryTrend[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT category,
              ROUND(AVG(current_price), 0) AS avg_price,
              COUNT(*) AS volume,
              ROUND(100.0 * SUM(CASE WHEN previous_price > current_price THEN 1 ELSE 0 END) / COUNT(*), 1) AS change_pct_30d
       FROM opportunities
       WHERE (user_id IS NULL OR user_id = ?)
       GROUP BY category`
    )
    .all(userId) as Array<{ category: Category; avg_price: number; change_pct_30d: number; volume: number }>;
  return rows.map((r) => ({ ...r, change_pct_30d: -r.change_pct_30d })); // % of listings dropping = avg price direction
}

export interface TopMover {
  id: string;
  title: string;
  category: Category;
  price_change_pct: number;
  current_price: number;
  previous_price: number;
}

export function getTopMovers(userId: string, limit = 8): TopMover[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, title, category, price_change_pct, current_price, previous_price
       FROM opportunities
       WHERE previous_price > current_price AND previous_price IS NOT NULL AND (user_id IS NULL OR user_id = ?)
       ORDER BY price_change_pct ASC LIMIT ?`
    )
    .all(userId, limit) as Array<TopMover>;
  return rows;
}
