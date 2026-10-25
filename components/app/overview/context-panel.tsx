'use client';

/* Right context panel (plan §25, ≥1280px): selected/latest opportunity summary
   + monitor status. Server-rendered. */
import Link from 'next/link';
import { ArrowRight, Radar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Money, PriceDelta, RelativeTime } from '@/components/ui/atoms';
import { OrbitBadge, SampleBadge, StatusBadge } from '@/components/ui/badges';
import { ScoreBar } from '@/components/ui/score-bar';
import { Sparkline } from '@/components/ui/score-bar';
import { useI18n } from '@/lib/i18n/context';
import { type Monitor, type Opportunity, type PriceHistoryPoint } from '@/lib/types';

export function ContextPanel({
  opportunity,
  history,
  monitors,
}: {
  opportunity: Opportunity | null;
  history: PriceHistoryPoint[];
  monitors: Monitor[];
}) {
  const { t } = useI18n();
  const activeCount = monitors.filter((m) => m.status === 'active').length;
  const spark = history.map((h) => h.price).slice(-7);

  return (
    <div className="space-y-4">
      {opportunity ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('overview.context.latest')}</CardTitle>
            <Link
              href={`/app/opportunities?id=${opportunity.id}`}
              className="focus-ring rounded text-xs font-medium text-[color:var(--color-brand)] hover:underline"
            >
              {t('common.open')} →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <OrbitBadge tone="neutral">{t(`category.${opportunity.category}` as never)}</OrbitBadge>
                <StatusBadge status={opportunity.status} />
                {opportunity.is_sample && <SampleBadge />}
              </div>
              <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[var(--text-primary)]">
                {opportunity.title}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                {opportunity.source_marketplace} · <RelativeTime iso={opportunity.discovered_at} />
              </p>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <Money value={opportunity.current_price} className="text-lg text-[var(--text-primary)]" />
                {opportunity.price_change_pct != null && (
                  <div className="text-[11px]">
                    <PriceDelta pct={opportunity.price_change_pct} />
                  </div>
                )}
              </div>
              {spark.length > 1 && <Sparkline points={spark} height={32} width={80} />}
            </div>
            <ScoreBar score={opportunity.deal_score} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Radar className="mx-auto mb-2 size-5 text-[var(--text-subtle)]" strokeWidth={1.75} aria-hidden />
            <p className="text-[13px] font-medium text-[var(--text-primary)]">{t('overview.context.nothingTracked')}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{t('overview.context.nothingTrackedHint')}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('overview.context.monitorStatus')}</CardTitle>
          <span className="tnum text-xs text-[var(--text-muted)]">
            {activeCount} active
          </span>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {monitors.slice(0, 4).map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-2">
              <Link
                href={`/app/monitors?id=${m.id}`}
                className="focus-ring truncate rounded text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
              >
                {m.name}
              </Link>
              <span className="tnum flex shrink-0 items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: m.status === 'active' ? 'var(--color-positive)' : 'var(--text-subtle)' }}
                  aria-hidden
                />
                {m.status === 'active' ? `${m.match_count} ${t('overview.context.matches')}` : t('status.paused')}
              </span>
            </div>
          ))}
          <Link
            href="/app/monitors"
            className="focus-ring inline-flex items-center gap-1 rounded text-xs font-medium text-[color:var(--color-brand)] hover:underline"
          >
            {t('overview.context.manage')} <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
