'use client';

import { RotateCcw, TriangleAlert } from 'lucide-react';

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid place-items-center py-24">
      <div className="max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <span className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-[#F790091A] text-[color:var(--color-warning)]">
          <TriangleAlert className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="text-base font-semibold text-[var(--text-primary)]">Something went wrong</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          This panel failed to load. Your data is safe — try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="focus-ring mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white hover:opacity-90"
        >
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </button>
      </div>
    </div>
  );
}
