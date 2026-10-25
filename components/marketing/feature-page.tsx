/* Shared feature page template (plan §18): hero, visual, benefit rows,
   works-with list, FAQ, bottom CTA. */
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { SmoothAccordion } from '@/components/easyui/SmoothAccordion';
import type { AccordionItem } from '@/components/easyui/SmoothAccordion';
import type { ReactNode } from 'react';

export interface FeaturePageData {
  slug: string;
  title: string;
  heading: string;
  sub: string;
  benefits: Array<{ title: string; body: string }>;
  worksWith: string[];
  faq: Array<{ q: string; a: string }>;
  visual: ReactNode;
}

export function FeaturePage({ data, related }: { data: FeaturePageData; related: Array<{ label: string; href: string }> }) {
  const faqItems: AccordionItem[] = data.faq.map((f, i) => ({
    id: `faq-${i}`,
    title: f.q,
    content: <p className="text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{f.a}</p>,
  }));

  return (
    <>
      {/* Hero */}
      <section className="border-b border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 text-center md:py-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-brand)]">Feature</p>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl md:leading-[1.1]">
            {data.heading}
          </h1>
          <p className="prose-measure mx-auto mt-4 text-[16px] leading-relaxed text-[var(--color-ink-secondary)] md:text-[17px]">
            {data.sub}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--color-ink)] px-5 text-[15px] font-medium text-white hover:opacity-90"
            >
              Start free <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/pricing"
              className="focus-ring inline-flex h-11 items-center rounded-lg border border-[var(--color-line-strong)] px-5 text-[15px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Visual */}
      <section aria-label={`${data.title} preview`} className="mx-auto max-w-4xl px-6 py-14">
        {data.visual}
      </section>

      {/* Benefits */}
      <section aria-labelledby="benefits-heading" className="border-y border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-[900px] px-6 py-16 md:py-20">
          <h2 id="benefits-heading" className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Why it matters
          </h2>
          <div className="mt-8 space-y-8">
            {data.benefits.map((b, i) => (
              <div key={b.title} className="flex gap-4">
                <span className="tnum grid size-8 shrink-0 place-items-center rounded-full bg-[var(--color-ink)] text-[13px] font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[17px] font-semibold text-[var(--color-ink)]">{b.title}</h3>
                  <p className="prose-measure mt-1.5 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">
                    {b.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Works with */}
      <section aria-labelledby="works-heading" className="mx-auto max-w-[900px] px-6 py-14">
        <h2 id="works-heading" className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--color-ink-tertiary)]">
          Works with
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.worksWith.map((w) => (
            <span
              key={w}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-[13px] text-[var(--color-ink-secondary)]"
            >
              <Check className="size-3.5 text-[var(--color-positive)]" aria-hidden />
              {w}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-[var(--color-ink-tertiary)]">
          Sources marked “coming soon” activate with the production crawling backend.
        </p>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="border-y border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-[760px] px-6 py-16">
          <h2 id="faq-heading" className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Frequently asked
          </h2>
          <div className="mt-6">
            <SmoothAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-[1200px] px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          Put {data.title.toLowerCase()} to work
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--color-ink-secondary)]">
          Free plan includes 3 monitors. No credit card required.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="focus-ring inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--color-ink)] px-5 text-[15px] font-medium text-white hover:opacity-90"
          >
            Start free <ArrowRight className="size-4" aria-hidden />
          </Link>
          {related.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="focus-ring inline-flex h-11 items-center rounded-lg border border-[var(--color-line-strong)] px-4 text-[14px] font-medium text-[var(--color-ink)] hover:bg-white"
            >
              {r.label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
