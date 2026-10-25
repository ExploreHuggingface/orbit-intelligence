import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Eye, Scale, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'ORBIT Intelligence turns passive web search into an active opportunity pipeline. Our mission, principles, and how we think about data.',
  alternates: { canonical: '/about' },
};

const PRINCIPLES = [
  {
    icon: Eye,
    title: 'Transparency over theater',
    body: 'Every estimate is labeled as an estimate. Every record links its evidence. When something is simulated in this build, the interface says so — you should never wonder what is real.',
  },
  {
    icon: Scale,
    title: 'The operator owns the decision',
    body: 'ORBIT surfaces and scores; you judge. We will not pretend an algorithm can guarantee a return, and we will not bury disclaimers where you can’t find them.',
  },
  {
    icon: Zap,
    title: 'Speed is the product',
    body: 'The best opportunities close in hours. Everything we build — monitors, alerts, comparisons — exists to compress the distance between “listed” and “you know”.',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-[860px] px-6 py-16 md:py-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-brand)]">About</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl md:leading-[1.1]">
            Search engines find. Operators act. ORBIT is the bridge.
          </h1>
          <p className="prose-measure mt-6 text-[16px] leading-relaxed text-[var(--color-ink-secondary)] md:text-[17px]">
            ORBIT Intelligence is a B2C internet-intelligence platform. It continuously searches the web for
            products, properties, investments and rare items, compares prices against estimated reference values,
            tracks availability, scores each match, and notifies you when new results appear. Every interaction
            produces a structured record — a monitor, an opportunity, a collection, a comparison — not a conversation
            transcript.
          </p>
        </div>
      </section>

      <section aria-labelledby="principles-heading" className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
        <h2 id="principles-heading" className="text-center text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          Principles
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-xl border border-[var(--color-line)] bg-white p-6">
              <span className="grid size-10 place-items-center rounded-lg bg-[var(--color-brand-subtle)] text-[var(--color-brand)]">
                <p.icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 text-[17px] font-semibold text-[var(--color-ink)]">{p.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="data-heading" className="border-y border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-[860px] px-6 py-16 md:py-20">
          <h2 id="data-heading" className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            How we think about data
          </h2>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[var(--color-ink-secondary)]">
            <p>
              <strong className="font-semibold text-[var(--color-ink)]">Estimates are estimates.</strong> Reference
              values, yields and deal scores are computed from tracked observations and public reference data. They
              are illustrative, clearly labeled in the product, and never presented as appraisals or investment
              advice.
            </p>
            <p>
              <strong className="font-semibold text-[var(--color-ink)]">Your data is yours.</strong> Account data is
              stored in a dedicated database (Supabase Postgres in production), exportable as JSON in one click, and
              never sold. We use cookies for essential site functionality only.
            </p>
            <p>
              <strong className="font-semibold text-[var(--color-ink)]">This build is honest about its edges.</strong>{' '}
              Live crawling activates with the production backend. Until then, the product runs on curated sample
              data — every seeded record carries a “sample data” badge, and nothing in the UI claims live crawling,
              verified savings, or guaranteed returns.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="team-heading" className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
        <h2 id="team-heading" className="text-center text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          The team
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-[14px] text-[var(--color-ink-secondary)]">
          Role placeholders — real bios arrive with real faces. What matters today is the product.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {['Founding Engineer', 'Crawler & Data', 'Product Design', 'Growth & Community'].map((role) => (
            <div key={role} className="rounded-xl border border-[var(--color-line)] bg-white p-5 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--color-surface-subtle)] text-[13px] font-semibold text-[var(--color-ink-tertiary)]">
                —
              </span>
              <p className="mt-3 text-[13px] font-medium text-[var(--color-ink)]">{role}</p>
              <p className="text-[12px] text-[var(--color-ink-tertiary)]">Join us →</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Build your pipeline today
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--color-ink)] px-5 text-[15px] font-medium text-white hover:opacity-90"
            >
              Start free <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="focus-ring inline-flex h-11 items-center rounded-lg border border-[var(--color-line-strong)] px-5 text-[15px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
