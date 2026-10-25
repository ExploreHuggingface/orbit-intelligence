/* ============================================================================
   Opportunities + search data access (plan §8 contract).
   All queries are scoped: user-created rows to their owner, global seed rows
   (user_id IS NULL) readable by every authenticated user.
   ========================================================================== */

import { getDb } from '@/lib/db';
import { mapOpportunity, getHistory } from '@/lib/db/rows';
import type { OpportunityFilters, Paginated, Opportunity, OpportunityStatus, PriceHistoryPoint, Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

function buildWhere(userId: string, f: OpportunityFilters): { where: string; params: Record<string, unknown> } {
  const clauses = ['(user_id IS NULL OR user_id = @uid)'];
  const params: Record<string, unknown> = { uid: userId };

  if (f.q) {
    clauses.push(
      `(title LIKE @q OR description LIKE @q OR attributes LIKE @q OR source_marketplace LIKE @q OR real_estate LIKE @q)`
    );
    params.q = `%${f.q}%`;
  }
  if (f.category && f.category !== 'all') {
    clauses.push('category = @category');
    params.category = f.category;
  }
  if (f.status && f.status !== 'all') {
    clauses.push('status = @status');
    params.status = f.status;
  }
  if (f.price_min != null) {
    clauses.push('current_price >= @price_min');
    params.price_min = f.price_min;
  }
  if (f.price_max != null) {
    clauses.push('current_price <= @price_max');
    params.price_max = f.price_max;
  }
  if (f.price_drop_only) {
    clauses.push('(previous_price IS NOT NULL AND previous_price > current_price)');
  }
  if (f.min_match_score != null) {
    clauses.push('match_score >= @min_match_score');
    params.min_match_score = f.min_match_score;
  }
  if (f.city?.length) {
    clauses.push(
      `(${f.city.map((_, i) => `json_extract(real_estate, '$.city') = @city${i}`).join(' OR ')})`
    );
    f.city.forEach((c, i) => (params[`city${i}`] = c));
  }
  if (f.neighborhoods?.length) {
    clauses.push(
      `(${f.neighborhoods.map((_, i) => `json_extract(real_estate, '$.neighborhood') = @nbh${i}`).join(' OR ')})`
    );
    f.neighborhoods.forEach((c, i) => (params[`nbh${i}`] = c));
  }
  if (f.property_type) {
    clauses.push(`json_extract(real_estate, '$.property_type') = @property_type`);
    params.property_type = f.property_type;
  }
  if (f.bedrooms_min != null) {
    clauses.push(`json_extract(real_estate, '$.bedrooms') >= @bedrooms_min`);
    params.bedrooms_min = f.bedrooms_min;
  }
  if (f.yield_min != null) {
    clauses.push(`json_extract(real_estate, '$.gross_yield_pct') >= @yield_min`);
    params.yield_min = f.yield_min;
  }
  if (f.price_per_m2_max != null) {
    clauses.push(`(current_price / json_extract(real_estate, '$.area_m2')) <= @ppm2`);
    params.ppm2 = f.price_per_m2_max;
  }
  if (f.condition) {
    clauses.push(`json_extract(attributes, '$.condition') = @condition`);
    params.condition = f.condition;
  }
  if (f.brand?.length) {
    clauses.push(
      `(${f.brand.map((_, i) => `json_extract(attributes, '$.brand') = @brand${i}`).join(' OR ')})`
    );
    f.brand.forEach((c, i) => (params[`brand${i}`] = c));
  }
  if (f.marketplaces?.length) {
    clauses.push(
      `(${f.marketplaces.map((_, i) => `source_marketplace = @mkt${i}`).join(' OR ')})`
    );
    f.marketplaces.forEach((c, i) => (params[`mkt${i}`] = c));
  }
  return { where: clauses.join(' AND '), params };
}

function orderClause(sort: OpportunityFilters['sort']): string {
  switch (sort) {
    case 'lowest_price':
      return 'current_price ASC';
    case 'highest_deal_score':
      return 'deal_score DESC';
    case 'biggest_price_drop':
      return 'price_change_pct ASC';
    case 'best_match':
      return 'match_score DESC';
    case 'newest':
    default:
      return 'discovered_at DESC';
  }
}

export function searchOpportunities(
  userId: string,
  f: OpportunityFilters
): Paginated<Opportunity> {
  const db = getDb();
  const page = Math.max(1, f.page ?? 1);
  const perPage = Math.min(50, Math.max(1, f.per_page ?? 10));
  const { where, params } = buildWhere(userId, f);

  const total = (
    db.prepare(`SELECT COUNT(*) AS n FROM opportunities WHERE ${where}`).get(params) as { n: number }
  ).n;

  const rows = db
    .prepare(
      `SELECT * FROM opportunities WHERE ${where} ORDER BY ${orderClause(f.sort)} LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: perPage, offset: (page - 1) * perPage }) as Array<Record<string, unknown>>;

  return {
    rows: rows.map(mapOpportunity),
    count: total,
    page,
    per_page: perPage,
    total_pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export function getOpportunityById(userId: string, id: string): Opportunity | null {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM opportunities WHERE id = ? AND (user_id IS NULL OR user_id = ?)')
    .get(id, userId) as Record<string, unknown> | undefined;
  return row ? mapOpportunity(row) : null;
}

export function getOpportunityHistory(id: string): PriceHistoryPoint[] {
  return getHistory(getDb(), id);
}

export function updateOpportunityStatus(
  userId: string,
  ids: string[],
  status: OpportunityStatus
): number {
  const db = getDb();
  const stmt = db.prepare(
    `UPDATE opportunities SET status = ? WHERE id = ? AND user_id = ?`
  );
  let changed = 0;
  const tx = db.transaction(() => {
    for (const id of ids) {
      const r = stmt.run(status, id, userId);
      changed += r.changes;
    }
  });
  tx();
  return changed;
}

export function toggleInteresting(userId: string, id: string, interesting: boolean): boolean {
  const db = getDb();
  const r = db
    .prepare(`UPDATE opportunities SET is_interesting = ? WHERE id = ? AND user_id = ?`)
    .run(interesting ? 1 : 0, id, userId);
  return r.changes > 0;
}

/** Distinct filter facets for the Discover rail, category-adaptive. */
export function getFacets(userId: string): {
  cities: string[];
  neighborhoods: string[];
  brands: string[];
  marketplaces: string[];
} {
  const db = getDb();
  const vis = '(user_id IS NULL OR user_id = ?)';
  const cities = (
    db
      .prepare(
        `SELECT DISTINCT json_extract(real_estate, '$.city') AS v FROM opportunities
         WHERE real_estate IS NOT NULL AND ${vis} ORDER BY v`
      )
      .all(userId) as Array<{ v: string }>
  ).map((r) => r.v);
  const neighborhoods = (
    db
      .prepare(
        `SELECT DISTINCT json_extract(real_estate, '$.neighborhood') AS v FROM opportunities
         WHERE real_estate IS NOT NULL AND ${vis} ORDER BY v`
      )
      .all(userId) as Array<{ v: string }>
  ).map((r) => r.v);
  const brands = (
    db
      .prepare(
        `SELECT DISTINCT json_extract(attributes, '$.brand') AS v FROM opportunities
         WHERE json_extract(attributes, '$.brand') IS NOT NULL AND ${vis} ORDER BY v`
      )
      .all(userId) as Array<{ v: string }>
  ).map((r) => r.v);
  const marketplaces = (
    db
      .prepare(`SELECT DISTINCT source_marketplace AS v FROM opportunities WHERE ${vis} ORDER BY v`)
      .all(userId) as Array<{ v: string }>
  ).map((r) => r.v);
  return { cities, neighborhoods, brands, marketplaces };
}

/** Category counts for tab badges. */
export function getCountsByStatus(userId: string): Record<OpportunityStatus | 'all', number> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT status, COUNT(*) AS n FROM opportunities
       WHERE (user_id IS NULL OR user_id = ?) GROUP BY status`
    )
    .all(userId) as Array<{ status: string; n: number }>;
  const out: Record<string, number> = { all: 0 };
  for (const r of rows) {
    out[r.status] = r.n;
    out.all += r.n;
  }
  return out as Record<OpportunityStatus | 'all', number>;
}

export function getComparableOpportunities(userId: string, ids: string[]): Opportunity[] {
  if (ids.length === 0 || ids.length > 4) return [];
  const db = getDb();
  const placeholders = ids.map(() => '?').join(',');
  const rows = db
    .prepare(
      `SELECT * FROM opportunities WHERE id IN (${placeholders}) AND (user_id IS NULL OR user_id = ?)`
    )
    .all(...ids, userId) as Array<Record<string, unknown>>;
  const map = new Map(rows.map((r) => [String(r.id), mapOpportunity(r)]));
  return ids.map((id) => map.get(id)).filter((o): o is Opportunity => Boolean(o));
}

export function searchSuggestions(userId: string, q: string): string[] {
  if (!q || q.length < 2) return [];
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT title FROM opportunities WHERE (user_id IS NULL OR user_id = ?) AND title LIKE ?
       ORDER BY discovered_at DESC LIMIT 6`
    )
    .all(userId, `%${q}%`) as Array<{ title: string }>;
  return rows.map((r) => r.title);
}

export function getRecentQueries(userId: string): string[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT query, MAX(created_at) AS latest FROM searches WHERE user_id = ?
       GROUP BY query ORDER BY latest DESC LIMIT 10`
    )
    .all(userId) as Array<{ query: string }>;
  return rows.map((r) => r.query);
}

export function saveSearchRecord(userId: string, query: string, category: string | null): void {
  if (!query.trim()) return;
  const db = getDb();
  const validCategory =
    category && CATEGORIES.includes(category as Category) ? (category as Category) : null;
  db.prepare('INSERT INTO searches (user_id, query, category) VALUES (?, ?, ?)').run(
    userId,
    query.trim(),
    validCategory
  );
}
