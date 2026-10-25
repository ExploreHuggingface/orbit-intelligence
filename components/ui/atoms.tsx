/* Numbered pagination (plan §25) + display atoms. */
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/easyui/utils';
import { formatMoney, formatRelative } from '@/lib/utils/format';

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );
  const rendered: Array<number | 'gap'> = [];
  for (let i = 0; i < pages.length; i++) {
    const prev = pages[i - 1];
    if (prev && pages[i] - prev > 1) rendered.push('gap');
    rendered.push(pages[i]);
  }
  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="Pagination">
      <button
        type="button"
        className="focus-ring grid size-8 place-items-center rounded-md border border-[var(--border)] text-[var(--text-secondary)] disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>
      {rendered.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-xs text-[var(--text-subtle)]">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
            className={cn(
              'focus-ring tnum grid size-8 place-items-center rounded-md border text-xs font-medium',
              p === page
                ? 'border-transparent bg-[var(--accent)] text-white'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        className="focus-ring grid size-8 place-items-center rounded-md border border-[var(--border)] text-[var(--text-secondary)] disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

/** Server-rendered pagination as links (URL-param driven lists). */
export function PaginationLinks({
  page,
  totalPages,
  makeHref,
  className,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );
  const rendered: Array<number | 'gap'> = [];
  for (let i = 0; i < pages.length; i++) {
    const prev = pages[i - 1];
    if (prev && pages[i] - prev > 1) rendered.push('gap');
    rendered.push(pages[i]);
  }
  const btn =
    'focus-ring tnum grid h-8 min-w-8 place-items-center rounded-md border px-2 text-xs font-medium';
  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="Pagination">
      {page > 1 ? (
        <Link href={makeHref(page - 1)} className={cn(btn, 'border-[var(--border)] text-[var(--text-secondary)]')} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(btn, 'border-[var(--border)] opacity-40')} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}
      {rendered.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-xs text-[var(--text-subtle)]">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={makeHref(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              btn,
              p === page
                ? 'border-transparent bg-[var(--accent)] text-white'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
            )}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages ? (
        <Link href={makeHref(page + 1)} className={cn(btn, 'border-[var(--border)] text-[var(--text-secondary)]')} aria-label="Next page">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(btn, 'border-[var(--border)] opacity-40')} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}

export function Money({
  value,
  compact = false,
  className,
  withCents = false,
}: {
  value: number;
  compact?: boolean;
  className?: string;
  withCents?: boolean;
}) {
  return (
    <span className={cn('tnum font-semibold', className)}>{formatMoney(value, { compact, withCents })}</span>
  );
}

export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  return (
    <time dateTime={iso} title={iso} className={cn('text-[var(--text-muted)]', className)}>
      {formatRelative(iso)}
    </time>
  );
}

/** Signed price-change percentage, colored by direction. */
export function PriceDelta({ pct, className }: { pct: number | null; className?: string }) {
  if (pct == null) return <span className={cn('tnum text-[var(--text-subtle)]', className)}>—</span>;
  const down = pct < 0;
  return (
    <span className={cn('tnum font-medium', down ? 'text-[color:var(--color-positive)]' : 'text-[color:var(--color-negative)]', className)}>
      {down ? '' : '+'}
      {pct.toFixed(1)}%
    </span>
  );
}
