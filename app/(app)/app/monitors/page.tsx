import { requireUser } from '@/lib/auth/server';
import * as monitorsRepo from '@/lib/data/monitors';
import { getPlanForUser } from '@/lib/data/misc';
import { MonitorsTable } from '@/components/app/monitors/monitors-table';
import { getI18n } from '@/lib/i18n/server';

export const metadata = { title: 'Monitors' };

export default async function MonitorsPage() {
  const user = await requireUser('/app/monitors');
  const monitors = monitorsRepo.listMonitors(user.id);
  const { t } = await getI18n();
  const billing = getPlanForUser(user.id);
  const activeCount = monitorsRepo.countActiveMonitors(user.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{t('monitors.title')}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {t('monitors.subtitle')}
          </p>
        </div>
      </div>
      <MonitorsTable
        monitors={monitors}
        activeCount={activeCount}
        planMonitorLimit={billing?.plan.monitor_limit ?? 3}
        planName={billing?.plan.name ?? 'Free'}
      />
    </div>
  );
}
