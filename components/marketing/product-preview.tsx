/* Hero product preview (plan §17): dashboard composite built from real
   presentational markup — sharper and on-brand vs a PNG screenshot. */
import { Check } from 'lucide-react';
import { formatMoney } from '@/lib/utils/format';

const ROWS = [
  { title: '2-Zimmer-Wohnung, Friedrichshain', price: 329000, ref: 356000, score: 88, drop: '-3.8%' },
  { title: 'Omega Seamaster Diver 300M', price: 3850, ref: 4300, score: 82, drop: '-7.2%' },
  { title: 'Porsche 911 (997) OEM headlight', price: 890, ref: 1200, score: 91, drop: '-22.6%' },
  { title: 'ThinkPad X1 Carbon G9', price: 649, ref: 780, score: 87, drop: '-18.8%' },
];

export function ProductPreview({ className }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-lg)] ${className ?? ''}`}
      role="img"
      aria-label="ORBIT dashboard showing scored opportunities, a price chart and monitor alerts"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#E8EAEE]" />
        <span className="size-2.5 rounded-full bg-[#E8EAEE]" />
        <span className="size-2.5 rounded-full bg-[#E8EAEE]" />
        <span className="ml-3 rounded-md bg-white px-2.5 py-0.5 text-[11px] text-[var(--color-ink-tertiary)]">
          app.orbit-intelligence.com/overview
        </span>
      </div>

      <div className="grid grid-cols-[52px_minmax(0,1fr)] sm:grid-cols-[180px_minmax(0,1fr)]">
        {/* Mini sidebar */}
        <div className="border-r border-[var(--color-line)] p-3">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-[var(--color-brand-subtle)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <ellipse cx="12" cy="12" rx="9.5" ry="4.6" stroke="var(--color-brand)" strokeWidth="1.8" transform="rotate(-28 12 12)" />
                <circle cx="12" cy="12" r="3.4" fill="var(--color-brand)" />
              </svg>
            </span>
            <span className="hidden text-[13px] font-semibold sm:block">ORBIT</span>
          </div>
          <div className="space-y-1.5">
            {['Overview', 'Discover', 'Opportunities', 'Monitors', 'Collections'].map((item, i) => (
              <div
                key={item}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
                  i === 2 ? 'bg-[var(--color-brand-subtle)] font-medium text-[var(--color-brand)]' : 'text-[var(--color-ink-tertiary)]'
                }`}
              >
                <span className={`size-1.5 rounded-full ${i === 2 ? 'bg-[var(--color-brand)]' : 'bg-[#D5D9E0]'}`} />
                <span className="hidden sm:block">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main column */}
        <div className="p-4">
          {/* KPI strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              ['Active monitors', '5', 'var(--color-brand)'],
              ['Price drops', '32', 'var(--color-warning)'],
              ['Est. savings', '€366k', 'var(--color-positive)'],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-lg border border-[var(--color-line)] p-3">
                <p className="text-[10px] text-[var(--color-ink-tertiary)]">{label}</p>
                <p className="tnum text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>
                  {value}
                </p>
                <svg viewBox="0 0 64 16" className="mt-1 h-3 w-full" aria-hidden>
                  <path
                    d="M1,12 C10,10 14,13 22,9 C30,5 36,11 44,7 C52,3 58,6 63,4"
                    fill="none"
                    stroke={color}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="mt-3 overflow-hidden rounded-lg border border-[var(--color-line)]">
            <div className="grid grid-cols-[minmax(0,1fr)_64px_56px_44px] gap-2 border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.04em] text-[var(--color-ink-tertiary)]">
              <span>Item</span>
              <span className="text-right">Price</span>
              <span className="text-right">Drop</span>
              <span className="text-right">Score</span>
            </div>
            {ROWS.map((r, i) => (
              <div
                key={r.title}
                className={`grid grid-cols-[minmax(0,1fr)_64px_56px_44px] items-center gap-2 px-3 py-2 text-[11px] ${
                  i < ROWS.length - 1 ? 'border-b border-[var(--color-line)]' : ''
                }`}
              >
                <span className="truncate font-medium text-[var(--color-ink)]">{r.title}</span>
                <span className="tnum text-right font-semibold">{formatMoney(r.price, { compact: true })}</span>
                <span className="tnum text-right text-[var(--color-positive)]">{r.drop}</span>
                <span className="flex justify-end">
                  <span className="tnum rounded-full bg-[#12B76A1A] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-positive)]">
                    {r.score}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* Bottom row: chart + alert */}
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_150px] gap-3">
            <div className="rounded-lg border border-[var(--color-line)] p-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.04em] text-[var(--color-ink-tertiary)]">
                Discoveries over time
              </p>
              <svg viewBox="0 0 200 48" className="mt-1 h-12 w-full" aria-hidden>
                <defs>
                  <linearGradient id="ppg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M2,40 C20,36 30,30 48,32 C66,34 76,22 94,24 C112,26 124,14 142,16 C160,18 176,8 198,6 L198,48 L2,48 Z"
                  fill="url(#ppg)"
                />
                <path
                  d="M2,40 C20,36 30,30 48,32 C66,34 76,22 94,24 C112,26 124,14 142,16 C160,18 176,8 198,6"
                  fill="none"
                  stroke="var(--color-brand)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="rounded-lg border border-[var(--color-line)] p-3">
              <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.04em] text-[var(--color-ink-tertiary)]">
                <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-brand)]" />
                Alerts
              </p>
              <div className="mt-2 space-y-1.5">
                {['Price drop — Seamaster', 'New match — 997 part', 'Back in stock — X1C'].map((a) => (
                  <div key={a} className="flex items-center gap-1.5 rounded-md bg-[var(--color-surface-subtle)] px-2 py-1.5 text-[10px] text-[var(--color-ink-secondary)]">
                    <Check className="size-3 shrink-0 text-[var(--color-positive)]" aria-hidden />
                    <span className="truncate">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] text-[var(--color-ink-tertiary)]">
            Sample data — reference values are illustrative estimates
          </p>
        </div>
      </div>
    </div>
  );
}
