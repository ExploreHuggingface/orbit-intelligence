import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { USE_CASES } from '@/components/marketing/use-cases-data';

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const uc = USE_CASES.find((u) => u.slug === slug);
  if (!uc) return {};
  return { title: uc.title, description: uc.story, alternates: { canonical: `/use-cases/${slug}` } };
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const uc = USE_CASES.find((u) => u.slug === slug);
  if (!uc) notFound();

  return (
    <>
      <section className="border-b border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-[860px] px-6 py-16 md:py-24">
          <uc.icon className="size-9 text-[var(--color-brand)]" strokeWidth={1.75} aria-hidden />
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-4xl md:leading-[1.12]">
            {uc.heading}
          </h1>
          <p className="prose-measure mt-5 text-[16px] leading-relaxed text-[var(--color-ink-secondary)] md:text-[17px]">
            {uc.story}
          </p>
        </div>
      </section>

      <section aria-labelledby="day-heading" className="mx-auto max-w-[860px] px-6 py-16">
        <h2 id="day-heading" className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          A day with ORBIT
        </h2>
        <ol className="mt-8 space-y-0">
          {uc.timeline.map((t, i) => (
            <li key={t.time} className="relative flex gap-5 pb-8 last:pb-0">
              {i < uc.timeline.length - 1 && (
                <span className="absolute left-[52px] top-12 h-[calc(100%-3rem)] w-px bg-[var(--color-line)]" aria-hidden />
              )}
              <span className="tnum grid h-10 w-[105px] shrink-0 place-items-center rounded-lg border border-[var(--color-line)] bg-white text-[12px] font-semibold text-[var(--color-ink-secondary)]">
                {t.time}
              </span>
              <div className="min-w-0 pt-1.5">
                <p className="text-[15px] font-semibold text-[var(--color-ink)]">{t.title}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="outcomes-heading" className="border-y border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-[860px] px-6 py-16">
          <h2 id="outcomes-heading" className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            What you get
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {uc.outcomes.map((o) => (
              <li key={o} className="flex items-start gap-2.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-3.5 text-[14px] text-[var(--color-ink)]">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-positive)]" aria-hidden />
                {o}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          Start with the {uc.title.toLowerCase()} workflow
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--color-ink-secondary)]">
          Your workspace arrives preloaded with a matching sample monitor.
        </p>
        <Link
          href={`/signup?usecase=${uc.slug}`}
          className="focus-ring mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--color-ink)] px-5 text-[15px] font-medium text-white hover:opacity-90"
        >
          Start free <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    </>
  );
}
