/* Empty state: Lucide icon + one-line explanation + primary action (plan §15). */
import * as React from 'react';
import { cn } from '@/lib/easyui/utils';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-6 py-12 text-center',
        className
      )}
    >
      <Icon className="size-5 text-[var(--text-subtle)]" strokeWidth={1.75} aria-hidden />
      <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
      {description && <p className="max-w-sm text-xs leading-relaxed text-[var(--text-muted)]">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
