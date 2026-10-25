'use client';

/* Status + meta badges. Semantic color at 10% background + full-strength text,
   always with icon/text — never color-dot-only (plan §15). */
import * as React from 'react';
import { cn } from '@/lib/easyui/utils';
import {
  CircleDot,
  Star,
  SearchCheck,
  CircleSlash,
  ShoppingBag,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import type { OpportunityStatus } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

const TONES = {
  neutral: 'bg-neutral-100 text-neutral-700',
  positive: 'bg-[#12B76A1A] text-[color:var(--color-positive)]',
  negative: 'bg-[#F044381A] text-[color:var(--color-negative)]',
  warning: 'bg-[#F790091A] text-[color:var(--color-warning)]',
  info: 'bg-[#2E90FA1A] text-[color:var(--color-info)]',
  brand: 'bg-[color:var(--color-brand-subtle)] text-[color:var(--color-brand)]',
  violet: 'bg-[#7A5AF81A] text-[color:var(--color-violet)]',
} as const;

export type BadgeTone = keyof typeof TONES;

export function OrbitBadge({
  tone = 'neutral',
  className,
  children,
  ...props
}: React.ComponentProps<'span'> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[11px] font-semibold uppercase tracking-[0.02em]',
        TONES[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

const STATUS_META: Record<OpportunityStatus, { tone: BadgeTone; Icon: LucideIcon }> = {
  new: { tone: 'info', Icon: CircleDot },
  shortlisted: { tone: 'brand', Icon: Star },
  under_review: { tone: 'warning', Icon: SearchCheck },
  dismissed: { tone: 'neutral', Icon: CircleSlash },
  purchased: { tone: 'positive', Icon: ShoppingBag },
  completed: { tone: 'positive', Icon: CheckCircle2 },
};

export function StatusBadge({ status, className }: { status: OpportunityStatus; className?: string }) {
  const { t } = useI18n();
  const { tone, Icon } = STATUS_META[status];
  return (
    <OrbitBadge tone={tone} className={className}>
      <Icon className="size-3" strokeWidth={2} aria-hidden />
      {t(`status.${status}` as never)}
    </OrbitBadge>
  );
}

/** Required honesty badge on every seeded record (plan rule 6). */
export function SampleBadge({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <OrbitBadge tone="neutral" className={cn('border border-[var(--border)] bg-transparent', className)}>
      {t('label.sampleData')}
    </OrbitBadge>
  );
}

/** "Illustrative estimate" disclaimer tag. */
export function EstimateTag({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)]',
        className
      )}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
        <path d="M6 5.4v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="6" cy="3.6" r="0.7" fill="currentColor" />
      </svg>
      {t('label.illustrativeEstimate')}
    </span>
  );
}
