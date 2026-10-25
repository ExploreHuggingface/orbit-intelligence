import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/server';
import * as monitorsRepo from '@/lib/data/monitors';
import * as collectionsRepo from '@/lib/data/collections';
import * as searchRepo from '@/lib/data/search';
import { listActivity, listNotifications } from '@/lib/data/activity';
import { getPlanForUser } from '@/lib/data/misc';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email, profile: user.profile },
    subscription: getPlanForUser(user.id),
    monitors: monitorsRepo.listMonitors(user.id),
    collections: collectionsRepo.listCollections(user.id).map((c) => ({
      ...c,
      items: collectionsRepo.listCollectionItems(user.id, c.id).map((o) => o.id),
    })),
    notifications: listNotifications(user.id),
    activity: listActivity(user.id),
    recent_searches: searchRepo.getRecentQueries(user.id),
    note: 'Opportunity records are shared sample data; statuses you set on your own records are included in collections and activity.',
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="orbit-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
