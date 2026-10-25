import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/auth/server';
import * as searchRepo from '@/lib/data/search';
import { getHistory } from '@/lib/db/rows';
import { getDb } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EstimateTag, OrbitBadge, SampleBadge, StatusBadge } from '@/components/ui/badges';
import { Money, PriceDelta, RelativeTime } from '@/components/ui/atoms';
import { ScoreBar } from '@/components/ui/score-bar';
import { PriceChart } from '@/components/shared/price-chart';
import { CATEGORY_LABELS } from '@/lib/types';
import { formatMoney } from '@/lib/utils/format';

export const metadata = { title: 'Opportunity' };

function confidenceOf(opp: NonNullable<ReturnType<typeof searchRepo.getOpportunityById>>): {
  label: 'High' | 'Medium' | 'Low';
  tone: 'positive' | 'info' | 'warning';
  drivers: string[];
} {
  const drivers: string[] = [];
  let score = 0;
  if (opp.evidence_links.length >= 2) { score += 1; drivers.push('Multiple independent sources cited'); }
  if (opp.match_score >= 85) { score += 1; drivers.push(`Strong criteria match (${opp.match_score}/100)`); }
  if (opp.previous_price != null) { score += 1; drivers.push('Price history tracked across ≥2 observations'); }
  if (opp.real_estate) { score += 1; drivers.push('Structured property data extracted'); }
  if (score >= 3) return { label: 'High', tone: 'positive', drivers };
  if (score === 2) return { label: 'Medium', tone: 'info', drivers };
  return { label: 'Low', tone: 'warning', drivers };
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(`/app/opportunities?id=${id}`);
  const opp = searchRepo.getOpportunityById(user.id, id);
  if (!opp) notFound();

  const history = getHistory(getDb(), opp.id);
  const confidence = confidenceOf(opp);
  const re = opp.real_estate;
  const diff = opp.estimated_market_value != null ? opp.estimated_market_value - opp.current_price : null;
  const diffPct =
    diff != null && opp.estimated_market_value ? Math.round((diff / opp.estimated_market_value) * 1000) / 10 : null;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/app/opportunities"
          className="focus-ring inline-flex items-center gap-1 rounded text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="size-3.5" aria-hidden /> Back to Opportunities
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <OrbitBadge tone="neutral">{CATEGORY_LABELS[opp.category]}</OrbitBadge>
          <StatusBadge status={opp.status} />
          <OrbitBadge tone={confidence.tone}>{`Confidence: ${confidence.label}`}</OrbitBadge>
          {opp.is_sample && <SampleBadge />}
        </div>
        <h1 className="mt-2 max-w-3xl text-2xl font-semibold leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
          {opp.title}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[var(--text-muted)]">
          <a
            href={opp.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded text-[color:var(--color-brand)] hover:underline"
          >
            {opp.source_marketplace} ↗
          </a>
          <span aria-hidden>·</span>
          <span>Discovered <RelativeTime iso={opp.discovered_at} /></span>
          <span aria-hidden>·</span>
          <span>Last checked <RelativeTime iso={opp.last_checked_at} /></span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">Asking price</p>
                <Money value={opp.current_price} className="text-xl text-[var(--text-primary)]" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">Reference value</p>
                <Money value={opp.estimated_market_value ?? 0} className="text-xl text-[var(--text-secondary)]" />
                <EstimateTag />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">Difference</p>
                {diff != null && diffPct != null ? (
                  <>
                    <p className="tnum text-xl font-semibold text-[color:var(--color-positive)]">
                      −{formatMoney(Math.abs(diff), { compact: true })}
                    </p>
                    <p className="tnum text-[11px] text-[color:var(--color-positive)]">{diffPct}% below reference</p>
                  </>
                ) : (
                  <span className="text-[var(--text-subtle)]">—</span>
                )}
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">Deal score</p>
                <ScoreBar score={opp.deal_score} className="mt-2" />
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">Match score {opp.match_score}/100</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price history</CardTitle>
              {opp.price_change_pct != null && <PriceDelta pct={opp.price_change_pct} className="text-sm" />}
            </CardHeader>
            <CardContent>
              <PriceChart points={history} referenceValue={opp.estimated_market_value} height={240} />
            </CardContent>
          </Card>

          {re && (
            <Card>
              <CardHeader>
                <CardTitle>Real-estate analysis</CardTitle>
                <EstimateTag />
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-3">
                  {[
                    ['City', re.city],
                    ['Neighborhood', re.neighborhood],
                    ['Type', re.property_type],
                    ['Bedrooms', String(re.bedrooms)],
                    ['Area', `${re.area_m2} m²`],
                    ['Year built', String(re.year_built)],
                    ['Asking price', formatMoney(opp.current_price)],
                    ['Price / m²', formatMoney(Math.round(opp.current_price / re.area_m2))],
                    ['Est. rent / mo', formatMoney(re.est_rent_monthly)],
                    ['Gross yield', `${re.gross_yield_pct.toFixed(1)}%`],
                    ['Expenses / mo', formatMoney(re.expenses_monthly)],
                    ['Net yield', `${re.net_yield_pct.toFixed(1)}%`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[11px] text-[var(--text-muted)]">{k}</dt>
                      <dd className="tnum font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <details className="text-xs">
                  <summary className="focus-ring cursor-pointer list-none rounded text-[color:var(--color-brand)] hover:underline">
                    Assumptions & method
                  </summary>
                  <p className="mt-1.5 leading-relaxed text-[var(--text-muted)]">
                    Rent is estimated from comparable listings in {re.neighborhood}. Expenses assume 18% of gross
                    rent for tax, maintenance and management. Yields are gross of financing and transaction costs.
                    All figures are illustrative estimates, not appraisals.
                  </p>
                </details>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{opp.description}</p>
              {Object.entries(opp.attributes).length > 0 && (
                <dl className="flex flex-wrap gap-1.5">
                  {Object.entries(opp.attributes).map(([k, v]) => (
                    <span
                      key={k}
                      className="rounded-md border border-[var(--border)] bg-[var(--color-surface-subtle)] px-2 py-1 text-[11px] text-[var(--text-secondary)]"
                    >
                      <span className="capitalize text-[var(--text-muted)]">{k.replace(/_/g, ' ')}:</span>{' '}
                      <span className="font-medium">
                        {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v).replace(/_/g, ' ')}
                      </span>
                    </span>
                  ))}
                </dl>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Data confidence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <OrbitBadge tone={confidence.tone}>{confidence.label} confidence</OrbitBadge>
              <ul className="mt-1 space-y-1.5">
                {confidence.drivers.map((d) => (
                  <li key={d} className="flex items-start gap-1.5 text-[12px] leading-snug text-[var(--text-secondary)]">
                    <span aria-hidden>✓</span>
                    {d}
                  </li>
                ))}
              </ul>
              <p className="mt-2 border-t border-[var(--border-subtle)] pt-2 text-[11px] text-[var(--text-muted)]">
                Data freshness: last checked <RelativeTime iso={opp.last_checked_at} />. Evidence is linked below —
                always verify on the source listing before acting.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {opp.evidence_links.map((link) => {
                  const href = /^https?:\/\//.test(link) ? link : `https://duckduckgo.com/?q=${encodeURIComponent(link)}`;
                  return (
                    <li key={link}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring block truncate rounded text-xs text-[color:var(--color-brand)] hover:underline"
                      >
                        {link.replace(/^https?:\/\//, '')} ↗
                      </a>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <p className="rounded-lg border border-[var(--border)] bg-[var(--color-surface-subtle)] px-3.5 py-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
            AI-generated estimates are illustrative and do not guarantee investment returns. ORBIT does not verify
            listings with sellers.
          </p>
        </aside>
      </div>
    </div>
  );
}
