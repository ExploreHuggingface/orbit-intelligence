import { requireUser } from '@/lib/auth/server';
import { IntegrationsGrid } from '@/components/app/integrations-grid';

export const metadata = { title: 'Integrations' };

export default async function IntegrationsPage() {
  await requireUser('/app/integrations');
  return <IntegrationsGrid />;
}
