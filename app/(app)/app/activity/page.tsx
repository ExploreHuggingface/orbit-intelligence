import { requireUser } from '@/lib/auth/server';
import { getI18n } from '@/lib/i18n/server';
import { listActivity } from '@/lib/data/activity';
import { ActivityTimeline } from '@/components/app/overview/activity-feed';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Activity' };

export default async function ActivityPage() {
  const user = await requireUser('/app/activity');
  const { t } = await getI18n();
  const events = listActivity(user.id, { limit: 100 });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{t('act.title')}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {t('act.subtitle')}
        </p>
      </div>
      <Card>
        <CardContent className="p-3">
          <ActivityTimeline events={events} />
        </CardContent>
      </Card>
    </div>
  );
}
