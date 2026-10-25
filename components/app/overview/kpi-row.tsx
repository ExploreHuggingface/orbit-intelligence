'use client';

/* KPI row (plan §25.3): EasyUI StatCards wired to DB-computed values, each a link. */
import Link from 'next/link';
import { StatCard } from '@/components/easyui/StatCard';
import { formatMoney, formatNumber } from '@/lib/utils/format';
import type { Kpis } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

function weekLabels(): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    out.push(
      new Date(Date.now() - i * 86_400_000).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric' })
    );
  }
  return out;
}

export function KpiRow({ kpis }: { kpis: Kpis }) {
  const { t } = useI18n();
  const labels = weekLabels();
  const cards = [
    {
      id: 'monitors',
      href: '/app/monitors',
      label: t('overview.kpi.activeMonitors'),
      value: kpis.active_monitors,
      previous: Math.max(0, kpis.active_monitors - kpis.monitors_trend),
      trend: kpis.spark_monitors,
      format: formatNumber,
      color: 'var(--color-brand)',
      period: t('overview.kpi.vsLastWeek'),
    },
    {
      id: 'opportunities',
      href: '/app/opportunities',
      label: t('overview.kpi.matching'),
      value: kpis.matching_opportunities,
      delta: kpis.opportunities_trend,
      trend: kpis.spark_opportunities,
      format: formatNumber,
      color: 'var(--color-info)',
      period: t('overview.kpi.vsLastWeek'),
    },
    {
      id: 'drops',
      href: '/app/opportunities?sort=biggest_price_drop',
      label: t('overview.kpi.priceDrops'),
      value: kpis.price_drops_detected,
      delta: kpis.price_drops_trend,
      trend: kpis.spark_price_drops,
      format: formatNumber,
      color: 'var(--color-warning)',
      period: t('overview.kpi.vsLastWeek'),
    },
    {
      id: 'savings',
      href: '/app/opportunities?sort=biggest_price_drop',
      label: t('overview.kpi.savings'),
      value: kpis.estimated_savings,
      delta: kpis.savings_trend,
      trend: kpis.spark_savings,
      format: (n: number) => formatMoney(n, { compact: true }),
      color: 'var(--color-positive)',
      period: t('overview.kpi.savingsNote'),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <Link
          key={c.id}
          href={c.href}
          className="focus-ring block rounded-xl transition-shadow hover:shadow-[var(--shadow-sm)]"
          aria-label={`${c.label}: ${c.format(c.value)}`}
        >
          <StatCard
            label={c.label}
            value={c.value}
            trend={c.trend}
            trendLabels={labels}
            delta={c.delta}
            goodWhen="up"
            period={c.period}
            format={c.format}
            color={c.color}
          />
        </Link>
      ))}
    </div>
  );
}
