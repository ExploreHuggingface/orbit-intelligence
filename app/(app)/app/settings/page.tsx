import { requireUser } from '@/lib/auth/server';
import { getPlanForUser } from '@/lib/data/misc';
import { countActiveMonitors } from '@/lib/data/monitors';
import { countCollections } from '@/lib/data/collections';
import { SettingsView } from '@/components/app/settings-view';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const user = await requireUser('/app/settings');
  const billing = getPlanForUser(user.id);
  const plan = billing?.plan ?? {
    code: 'free' as const,
    name: 'Free',
    monitor_limit: 3,
    collection_limit: 2,
    comparison_limit: 2,
    price_monthly_eur: 0,
    refresh_label: 'Daily refresh',
    features: ['3 monitors', 'Daily refresh', '2 collections', 'In-app alerts'],
  };
  const storageMode = process.env.NEXT_PUBLIC_SUPABASE_URL ? ('supabase' as const) : ('local' as const);

  return (
    <SettingsView
      profile={user.profile}
      plan={plan}
      activeMonitors={countActiveMonitors(user.id)}
      collectionCount={countCollections(user.id)}
      storageMode={storageMode}
    />
  );
}
