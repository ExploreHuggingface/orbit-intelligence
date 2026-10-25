import { requireUser } from '@/lib/auth/server';
import * as collectionsRepo from '@/lib/data/collections';
import { getHistory } from '@/lib/db/rows';
import { getDb } from '@/lib/db';
import { getPlanForUser } from '@/lib/data/misc';
import { CollectionsManager } from '@/components/app/collections-manager';
import type { PriceHistoryPoint } from '@/lib/types';

export const metadata = { title: 'Collections' };

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>;
}) {
  const user = await requireUser('/app/collections');
  const { collection: collectionId } = await searchParams;

  const collections = collectionsRepo.listCollections(user.id);
  const active = collections.find((c) => c.id === collectionId) ?? collections[0] ?? null;
  const items = active ? collectionsRepo.listCollectionItems(user.id, active.id) : [];

  const histories: Record<string, PriceHistoryPoint[]> = {};
  if (items.length > 0) {
    const db = getDb();
    for (const o of items) histories[o.id] = getHistory(db, o.id);
  }

  const billing = getPlanForUser(user.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Collections</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Group opportunities you&apos;re tracking. Every action here persists to your workspace.
        </p>
      </div>
      <CollectionsManager
        collections={collections}
        activeCollection={active}
        items={items}
        planCollectionLimit={billing?.plan.collection_limit ?? 2}
        planName={billing?.plan.name ?? 'Free'}
        histories={histories}
      />
    </div>
  );
}
