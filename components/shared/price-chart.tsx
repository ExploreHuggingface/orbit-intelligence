'use client';

/* Price-history area chart: SVG, €-formatted axis, hover readout (plan §26). */
import * as React from 'react';
import { formatMoney } from '@/lib/utils/format';

export interface PricePoint {
  date: string;
  price: number;
  event?: string;
}

const PAD = { t: 14, r: 12, b: 24, l: 52 };

export function PriceChart({
  points,
  height = 220,
  className,
  referenceValue,
}: {
  points: PricePoint[];
  height?: number;
  className?: string;
  referenceValue?: number | null;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const width = 640;
  const innerW = width - PAD.l - PAD.r;
  const innerH = height - PAD.t - PAD.b;

  if (points.length < 2) {
    return (
      <div className={className} style={{ height }} aria-label="Not enough price history">
        <div className="grid h-full place-items-center rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--text-muted)]">
          Not enough price history yet
        </div>
      </div>
    );
  }

  const prices = points.map((p) => p.price);
  const ref = referenceValue ?? null;
  const lo = Math.min(...prices, ref ?? Infinity) * 0.985;
  const hi = Math.max(...prices, ref ?? -Infinity) * 1.015;
  const span = hi - lo || 1;
  const x = (i: number) => PAD.l + (i / (points.length - 1)) * innerW;
  const y = (v: number) => PAD.t + innerH - ((v - lo) / span) * innerH;

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.price).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${PAD.t + innerH} L${PAD.l},${PAD.t + innerH} Z`;
  const ticks = [lo + span * 0.25, lo + span * 0.5, lo + span * 0.75];

  return (
    <figure className={className} style={{ margin: 0 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Price history chart"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const rel = ((e.clientX - rect.left) / rect.width) * width;
          const i = Math.round(((rel - PAD.l) / innerW) * (points.length - 1));
          setHover(Math.min(points.length - 1, Math.max(0, i)));
        }}
      >
        <defs>
          <linearGradient id="price-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={width - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--border-subtle)" strokeDasharray="3 4" />
            <text x={PAD.l - 8} y={y(t) + 3.5} textAnchor="end" className="tnum" fontSize="10" fill="var(--text-subtle)">
              {formatMoney(t, { compact: true })}
            </text>
          </g>
        ))}
        {ref != null && (
          <g>
            <line x1={PAD.l} x2={width - PAD.r} y1={y(ref)} y2={y(ref)} stroke="var(--color-info)" strokeDasharray="5 4" opacity="0.7" />
            <text x={width - PAD.r} y={y(ref) - 5} textAnchor="end" fontSize="10" fill="var(--color-info)" className="tnum">
              ref {formatMoney(ref, { compact: true })}
            </text>
          </g>
        )}
        <path d={area} fill="url(#price-area)" />
        <path d={line} fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <text x={PAD.l} y={height - 6} fontSize="10" fill="var(--text-subtle)">
          {points[0].date}
        </text>
        <text x={width - PAD.r} y={height - 6} textAnchor="end" fontSize="10" fill="var(--text-subtle)">
          {points[points.length - 1].date}
        </text>
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + innerH} stroke="var(--border-strong, var(--color-line-strong))" />
            <circle cx={x(hover)} cy={y(points[hover].price)} r="3.5" fill="var(--color-brand)" stroke="white" strokeWidth="1.5" />
          </g>
        )}
      </svg>
      {hover != null && (
        <div className="mt-1 flex items-center justify-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs shadow-[var(--shadow-sm)]">
          <span className="tnum font-semibold text-[var(--text-primary)]">{formatMoney(points[hover].price)}</span>
          <span className="text-[var(--text-muted)]">{points[hover].date}</span>
          {points[hover].event && <span className="text-[var(--text-secondary)]">{points[hover].event}</span>}
        </div>
      )}
      <figcaption className="sr-only">Price history over the tracked period.</figcaption>
    </figure>
  );
}
