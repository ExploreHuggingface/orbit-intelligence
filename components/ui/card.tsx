/* ORBIT card primitives — white surface, 1px border, 12px radius (plan §10/13). */
import * as React from 'react';
import { cn } from '@/lib/easyui/utils';

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-xl border border-[var(--border)] bg-[var(--surface)]', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-4', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn('text-sm font-semibold tracking-[-0.005em] text-[var(--text-primary)]', className)}
      {...props}
    />
  );
}

export function CardSubtitle({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-xs text-[var(--text-muted)]', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] px-5 py-3', className)}
      {...props}
    />
  );
}

/** Section wrapper used across dashboard panels. */
export function Section({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('space-y-3', className)} {...props} />;
}
