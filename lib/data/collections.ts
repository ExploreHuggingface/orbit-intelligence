/* Collections data access. */
import { getDb } from '@/lib/db';
import { mapCollection, mapOpportunity } from '@/lib/db/rows';
import type { Collection, Opportunity } from '@/lib/types';
import { randomUUID } from 'node:crypto';

export function listCollections(userId: string): Collection[] {
  const rows = getDb()
    .prepare(
      `SELECT c.*, COUNT(ci.opportunity_id) AS item_count
       FROM collections c LEFT JOIN collection_items ci ON ci.collection_id = c.id
       WHERE c.user_id = ? GROUP BY c.id ORDER BY c.created_at ASC`
    )
    .all(userId) as Array<Record<string, unknown>>;
  return rows.map(mapCollection);
}

export function countCollections(userId: string): number {
  return (
    getDb().prepare('SELECT COUNT(*) AS n FROM collections WHERE user_id = ?').get(userId) as { n: number }
  ).n;
}

export function createCollection(userId: string, name: string): Collection {
  const db = getDb();
  const id = `col-${randomUUID().slice(0, 8)}`;
  db.prepare('INSERT INTO collections (id, user_id, name) VALUES (?, ?, ?)').run(id, userId, name);
  return mapCollection(
    db.prepare('SELECT c.*, 0 AS item_count FROM collections c WHERE id = ?').get(id) as Record<string, unknown>
  );
}

export function renameCollection(userId: string, id: string, name: string): boolean {
  return (
    getDb()
      .prepare('UPDATE collections SET name = ? WHERE id = ? AND user_id = ?')
      .run(name, id, userId).changes > 0
  );
}

export function deleteCollection(userId: string, id: string): boolean {
  return (
    getDb().prepare('DELETE FROM collections WHERE id = ? AND user_id = ?').run(id, userId).changes > 0
  );
}

export function listCollectionItems(userId: string, collectionId: string): Opportunity[] {
  const rows = getDb()
    .prepare(
      `SELECT o.* FROM collection_items ci
       JOIN opportunities o ON o.id = ci.opportunity_id
       JOIN collections c ON c.id = ci.collection_id
       WHERE ci.collection_id = ? AND c.user_id = ?
       ORDER BY ci.added_at DESC`
    )
    .all(collectionId, userId) as Array<Record<string, unknown>>;
  return rows.map(mapOpportunity);
}

export function addItem(userId: string, collectionId: string, opportunityId: string): boolean {
  const db = getDb();
  const owns = db
    .prepare('SELECT 1 AS x FROM collections WHERE id = ? AND user_id = ?')
    .get(collectionId, userId);
  if (!owns) return false;
  db.prepare(
    'INSERT OR IGNORE INTO collection_items (collection_id, opportunity_id) VALUES (?, ?)'
  ).run(collectionId, opportunityId);
  return true;
}

export function removeItem(userId: string, collectionId: string, opportunityId: string): boolean {
  const db = getDb();
  const owns = db
    .prepare('SELECT 1 AS x FROM collections WHERE id = ? AND user_id = ?')
    .get(collectionId, userId);
  if (!owns) return false;
  return (
    db
      .prepare('DELETE FROM collection_items WHERE collection_id = ? AND opportunity_id = ?')
      .run(collectionId, opportunityId).changes > 0
  );
}

export function isInAnyCollection(userId: string, opportunityId: string): Collection[] {
  const rows = getDb()
    .prepare(
      `SELECT c.*, 0 AS item_count FROM collections c
       JOIN collection_items ci ON ci.collection_id = c.id
       WHERE c.user_id = ? AND ci.opportunity_id = ?`
    )
    .all(userId, opportunityId) as Array<Record<string, unknown>>;
  return rows.map(mapCollection);
}
