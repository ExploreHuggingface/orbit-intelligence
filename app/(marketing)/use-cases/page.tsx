import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { USE_CASES } from '@/components/marketing/use-cases-data';

export const metadata: Metadata = {
  title: 'Use Cases',
  description: 'How investors, collectors and restorers use ORBIT to find opportunities first.',
  alternates: { canonical: '/use-cases' },
};

export default function UseCasesIndexPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
          Operators who move first
        </h1>
        <p className="prose-measure mx-auto mt-4 text-[16px] leading-relaxed text-[var(--color-ink-secondary)] md:text-[17px]">
          Three workflows, one platform: describe what you want, let ORBIT watch, act on scored matches.
        </p>
      </div>
      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {USE_CASES.map((u) => (
          <Link
            key={u.slug}
            href={`/use-cases/${u.slug}`}
            className="focus-ring group flex flex-col rounded-xl border border-[var(--color-line)] bg-white p-7 transition-shadow hover:shadow-[var(--shadow-lg)]"
          >
            <u.icon className="size-7 text-[var(--color-brand)]" strokeWidth={1.75} aria-hidden />
            <h2 className="mt-4 text-[18px] font-semibold text-[var(--color-ink)]">{u.title}</h2>
            <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{u.story}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-[14px] font-medium text-[var(--color-brand)]">
              See the day-in-the-life
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
