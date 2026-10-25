import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { OrbitMark } from '@/components/ui/logo';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-canvas)] px-6 text-center">
      <OrbitMark size={36} />
      <p className="tnum mt-6 text-[64px] font-semibold leading-none tracking-[-0.03em] text-[var(--color-ink)]">
        404
      </p>
      <h1 className="mt-3 text-xl font-semibold text-[var(--color-ink)]">
        This page is not in any of your monitors.
      </h1>
      <p className="prose-measure mt-2 text-[15px] leading-relaxed text-[var(--color-ink-secondary)]">
        The URL you followed doesn&apos;t exist — or the opportunity behind it already sold.
      </p>
      <form action="/app/discover" method="get" role="search" className="mt-8 flex w-full max-w-md gap-2">
        <div className="relative flex-1">
          <SearchX className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-tertiary)]" aria-hidden />
          <input
            type="search"
            name="q"
            placeholder="Search for it instead…"
            aria-label="Search opportunities"
            className="focus-ring h-11 w-full rounded-lg border border-[var(--color-line)] bg-white pl-10 pr-3.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="focus-ring h-11 shrink-0 rounded-lg bg-[var(--color-ink)] px-4 text-sm font-medium text-white hover:opacity-90"
        >
          Search
        </button>
      </form>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[14px]">
        <Link href="/" className="focus-ring rounded font-medium text-[color:var(--color-brand)] hover:underline">
          Back to home
        </Link>
        <Link href="/features" className="focus-ring rounded text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]">
          Features
        </Link>
        <Link href="/pricing" className="focus-ring rounded text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]">
          Pricing
        </Link>
      </div>
    </div>
  );
}
