'use client';

/* ORBIT DataTable: 44px rows, sticky header, sortable, skeleton rows (plan §15).
   Client component; parent passes plain data rows and column descriptors. */
import * as React from 'react';
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/easyui/utils';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  sort,
  onSortChange,
  skeletonRows = 4,
  isLoading = false,
  emptyState,
  onRowClick,
  rowClassName,
  className,
  minWidth = '52rem',
  ariaLabel,
}: {
  columns: Column<T>[];
  rows: T[];
  sort?: { key: string; direction: 'asc' | 'desc' } | null;
  onSortChange?: (key: string) => void;
  skeletonRows?: number;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;
  className?: string;
  minWidth?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={cn('w-full overflow-x-auto', className)} style={{ minWidth }}>
      <table className="w-full border-collapse text-left" style={{ minWidth }} aria-label={ariaLabel}>
        <thead className="sticky top-0 z-10 bg-[var(--color-surface-subtle)]">
          <tr>
            {columns.map((col) => {
              const active = sort?.key === col.key;
              const SortIcon = !col.sortable
                ? null
                : active
                  ? sort?.direction === 'asc'
                    ? ChevronUp
                    : ChevronDown
                  : ChevronsUpDown;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={
                    active
                      ? sort?.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : col.sortable
                        ? 'none'
                        : undefined
                  }
                  className={cn(
                    'h-9 border-b border-[var(--border)] px-3 text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--text-muted)]',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center'
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.sortable && SortIcon ? (
                    <button
                      type="button"
                      onClick={() => onSortChange?.(col.key)}
                      className={cn(
                        'focus-ring inline-flex items-center gap-1 rounded text-inherit',
                        active && 'text-[var(--text-primary)]'
                      )}
                      aria-label={`Sort by ${col.header}`}
                    >
                      {col.header}
                      <SortIcon className="size-3" strokeWidth={1.75} aria-hidden />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="h-11">
                  {columns.map((col) => (
                    <td key={col.key} className="border-b border-[var(--border-subtle)] px-3">
                      <div
                        className="h-4 animate-pulse rounded bg-[var(--surface-raised)]"
                        style={{ width: `${45 + ((i * 17 + col.key.length * 13) % 40)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'h-11 border-b border-[var(--border-subtle)] transition-colors last:border-b-0 hover:bg-[var(--color-surface-subtle)]',
                    onRowClick && 'cursor-pointer',
                    rowClassName?.(row)
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-3 text-[13px] text-[var(--text-primary)]',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center'
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      {!isLoading && rows.length === 0 && emptyState ? <div className="p-4">{emptyState}</div> : null}
    </div>
  );
}
