/* Usage meter card — shared between sidebar footer and settings plan tab (plan §24/VII). */
import Link from 'next/link';
import { cn } from '@/lib/easyui/utils';

export function UsageMeter({
  used,
  limit,
  planName,
  collapsed = false,
  variant = 'sidebar',
}: {
  used: number;
  limit: number; // -1 = unlimited
  planName: string;
  collapsed?: boolean;
  variant?: 'sidebar' | 'settings';
}) {
  const unlimited = limit < 0;
  const pct = unlimited ? 18 : Math.min(100, Math.round((used / limit) * 100));
  const nearLimit = !unlimited && pct >= 80;

  const inner = (
    <div
      className={cn(
        'rounded-lg border bg-[var(--color-surface-subtle)] transition-colors hover:border-[var(--border-hover)]',
        variant === 'sidebar' ? 'border-[var(--border)]' : 'border-[var(--border)]',
        collapsed && 'grid place-items-center border-transparent bg-transparent'
      )}
    >
      {collapsed ? (
        <span className="tnum grid size-9 place-items-center text-[10px] font-semibold text-[var(--text-secondary)]" title={`${planName} plan — ${used}/${unlimited ? '∞' : limit} monitors`}>
          {used}
        </span>
      ) : (
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className="text-[var(--text-secondary)]">{planName} plan</span>
            <span className={cn('tnum', nearLimit ? 'text-[color:var(--color-warning)]' : 'text-[var(--text-muted)]')}>
              {used} / {unlimited ? '∞' : limit} monitors
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-raised)]">
            <div
              className="h-full rounded-full transition-[width]"
              style={{
                width: `${pct}%`,
                backgroundColor: nearLimit ? 'var(--color-warning)' : 'var(--color-brand)',
              }}
              role="progressbar"
              aria-valuenow={used}
              aria-valuemin={0}
              aria-valuemax={unlimited ? 100 : limit}
              aria-label={`Monitors used: ${used} of ${unlimited ? 'unlimited' : limit}`}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Link href="/app/settings?tab=plan" className="block" aria-label="Open plan and usage">
      {inner}
    </Link>
  );
}
