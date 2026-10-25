import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Bell, FolderOpen, LineChart, Radar, Scale, Search } from 'lucide-react';
import { FEATURES } from '@/components/marketing/features-data';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Monitors, discovery, deal scores, collections, alerts and market insights — the operational layer between search and action.',
  alternates: { canonical: '/features' },
};

const ICONS = {
  monitors: Radar,
  discover: Search,
  'deal-scores': Scale,
  collections: FolderOpen,
  alerts: Bell,
  'market-insights': LineChart,
} as const;

export default function FeaturesIndexPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
          Everything ORBIT does
        </h1>
        <p className="prose-measure mx-auto mt-4 text-[16px] leading-relaxed text-[var(--color-ink-secondary)] md:text-[17px]">
          Six capabilities that turn passive web search into an active opportunity pipeline.
        </p>
      </div>
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = ICONS[f.slug as keyof typeof ICONS] ?? Radar;
          return (
            <Link
              key={f.slug}
              href={`/features/${f.slug}`}
              className="focus-ring group flex flex-col rounded-xl border border-[var(--color-line)] bg-white p-6 transition-shadow hover:shadow-[var(--shadow-lg)]"
            >
              <span className="grid size-10 place-items-center rounded-lg bg-[var(--color-brand-subtle)] text-[var(--color-brand)]">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h2 className="mt-4 text-[17px] font-semibold text-[var(--color-ink)]">{f.title}</h2>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">
                {f.sub.length > 130 ? `${f.sub.slice(0, 130)}…` : f.sub}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-medium text-[var(--color-brand)]">
                Learn more
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
