/* Deal score bar + sparkline (achromatic chrome, chromatic data — plan §10). */
import { cn } from '@/lib/easyui/utils';
import { dealScoreTone } from '@/lib/utils/format';

const TONE_COLOR = {
  positive: 'var(--color-positive)',
  info: 'var(--color-info)',
  warning: 'var(--color-warning)',
} as const;

export function ScoreBar({ score, className }: { score: number; className?: string }) {
  const tone = dealScoreTone(score);
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--surface-raised)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: TONE_COLOR[tone] }}
          role="meter"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Deal score ${score} of 100`}
        />
      </div>
      <span className="tnum text-xs font-semibold text-[var(--text-primary)]">{score}</span>
    </div>
  );
}

/** 7-point sparkline, 40px tall, no axes (plan §25). */
export function Sparkline({
  points,
  color = 'var(--color-brand)',
  className,
  height = 40,
  width = 96,
}: {
  points: number[];
  color?: string;
  className?: string;
  height?: number;
  width?: number;
}) {
  if (points.length < 2) points = [0, 0];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => [i * step, height - 4 - ((p - min) / span) * (height - 8)] as const);
  const path = coords
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  const area = `${path} L${width},${height} L0,${height} Z`;
  const gradientId = `spark-${Math.abs(points.join(',').length * 31 + points[0] * 7)}-${points[points.length - 1]}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="2.25" fill={color} />
    </svg>
  );
}
