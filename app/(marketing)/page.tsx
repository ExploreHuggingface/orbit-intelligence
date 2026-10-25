import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Bell, Building2, Check, Radar, Scale, Watch, Wrench, LineChart } from 'lucide-react';
import { ProductPreview } from '@/components/marketing/product-preview';

export const metadata: Metadata = {
  title: 'ORBIT Intelligence — Your next opportunity is out there',
  description:
    'ORBIT continuously scans marketplaces and the web, scores what matches your criteria, and alerts you before the market does.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'ORBIT Intelligence',
    description: 'Internet intelligence for operators. Monitor anything. Score every match. Move first.',
    type: 'website',
  },
};

const VALUE_PROPS = [
  {
    icon: Radar,
    title: 'Monitor anything',
    body: 'Describe what you want in plain language — a yield threshold, a reference number, a condition. ORBIT watches the sources for you.',
  },
  {
    icon: Scale,
    title: 'Scored against reference values',
    body: 'Every match arrives with price context: reference band, observed drops, and a deal score that shows how far below the estimate it sits.',
  },
  {
    icon: Bell,
    title: 'Alerted in real time',
    body: 'In-app notifications the moment a match appears or a tracked price moves. The good ones sell in hours — you’ll know in minutes.',
  },
];

const SHOWCASE = [
  {
    tag: 'Discover',
    title: 'Search that remembers what you’re hunting',
    body: 'Natural-language queries, category-aware filters, and saved searches. Every result is a structured record you can act on — not a link you lose.',
    bullets: ['Natural-language criteria', 'Filters that actually filter', 'Grid and table views'],
    visual: 'discover' as const,
  },
  {
    tag: 'Evaluate',
    title: 'A deal score on every match',
    body: 'Each opportunity is priced against an estimated reference band with the evidence linked. For property, yields are computed for you.',
    bullets: ['Reference bands with sources', 'Deal + match scores', 'Gross and net yields for real estate'],
    visual: 'score' as const,
  },
  {
    tag: 'Monitor',
    title: 'Alerts while the listing is still live',
    body: 'Monitors check sources on your schedule, flag price drops, and push notifications the moment something matches — so you move first.',
    bullets: ['In-app alerts and digests', 'Price-drop-only mode', 'Pause and resume anytime'],
    visual: 'alerts' as const,
  },
];

const USE_CASES = [
  {
    icon: Building2,
    title: 'Real Estate',
    story: 'Apartments in Berlin-Friedrichshain under €350k with estimated gross yield above 5.5%. ORBIT monitors sources continuously and pushes each new listing with the deal analysis computed.',
    href: '/use-cases/real-estate',
  },
  {
    icon: Watch,
    title: 'Watches & Collectors',
    story: 'An Omega Seamaster below €4,000 in excellent condition with box and papers. ORBIT compares each listing to a reference price band and flags meaningful outliers.',
    href: '/use-cases/collectors',
  },
  {
    icon: Wrench,
    title: 'Cars & Parts',
    story: 'An OEM 911 (997) headlight that appears on forums and sells within hours. ORBIT watches sources, matches part number and condition, and alerts while the listing is live.',
    href: '/use-cases/deal-hunting',
  },
];

const STATS = [
  { value: '30 min', label: 'check frequency at the Pro tier' },
  { value: '40+', label: 'supported sources planned at launch' },
  { value: '7', label: 'opportunity categories tracked' },
];

const TESTIMONIALS = [
  {
    quote:
      'I used to check six sites twice a day. Now ORBIT surfaces the listings that matter — with the math already done.',
    name: 'Markus',
    role: 'property investor',
    featured: true,
  },
  {
    quote: 'The price-drop alert paid for a year of subscription the first week. The Seamaster I wanted came up 7% under band.',
    name: 'Elena',
    role: 'watch collector',
  },
  {
    quote: 'Found a NOS headlight for my 997 at 6am. It was sold by noon. I was first.',
    name: 'Tom',
    role: 'Porsche restorer',
  },
];

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'ORBIT Intelligence',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              'Internet intelligence platform that continuously scans marketplaces, scores matches against reference values, and alerts operators in real time.',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', description: 'Free plan with 3 monitors' },
          }),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(48rem 24rem at 50% -6rem, rgba(236,72,153,0.07), transparent 65%)',
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-16 text-center md:pb-24 md:pt-24">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-ink-secondary)]">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-brand)] opacity-60" />
              <span className="relative size-2 rounded-full bg-[var(--color-brand)]" />
            </span>
            Internet intelligence for operators
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--color-ink)] sm:text-5xl md:text-6xl">
            Your next opportunity is out there.
          </h1>
          <p className="prose-measure mx-auto mt-5 text-[17px] leading-relaxed text-[var(--color-ink-secondary)] md:text-lg">
            ORBIT continuously scans marketplaces and the web, scores what matches your criteria, and alerts you
            before the market does.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="focus-ring inline-flex h-12 items-center gap-2 rounded-lg bg-[var(--color-ink)] px-6 text-[15px] font-medium text-white hover:opacity-90"
            >
              Start free <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/features"
              className="focus-ring inline-flex h-12 items-center rounded-lg border border-[var(--color-line-strong)] bg-white px-6 text-[15px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-4 text-[13px] text-[var(--color-ink-tertiary)]">
            No credit card required · 3 monitors free · Cancel anytime
          </p>

          <div className="mx-auto mt-14 max-w-4xl">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* Logo bar */}
      <section aria-label="Trusted by" className="border-y border-[var(--color-line)] bg-white py-8">
        <div className="mx-auto max-w-[1200px] px-6">
          <p className="text-center text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--color-ink-tertiary)]">
            Trusted by independent investors and sourcing teams
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {['NORDKAP CAPITAL', 'brandt & voß', 'Fenwick Auctions', 'HAVEN PROPERTY', 'Studio Meridian', 'Kessler GbR'].map(
              (name) => (
                <span
                  key={name}
                  className="text-[13px] font-semibold tracking-[0.08em] text-[var(--color-ink-tertiary)] opacity-70"
                >
                  {name}
                </span>
              )
            )}
          </div>
          <p className="mt-4 text-center text-[11px] text-[var(--color-ink-tertiary)] opacity-70">
            Placeholder marks — composable demo content for real customer logos.
          </p>
        </div>
      </section>

      {/* Value props */}
      <section aria-labelledby="value-heading" className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
        <h2 id="value-heading" className="sr-only">
          Why ORBIT
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="rounded-xl border border-[var(--color-line)] bg-white p-6">
              <span className="grid size-10 place-items-center rounded-lg bg-[var(--color-brand-subtle)] text-[var(--color-brand)]">
                <v.icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 text-[17px] font-semibold text-[var(--color-ink)]">{v.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product showcase */}
      <section aria-labelledby="showcase-heading" className="border-y border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
          <h2 id="showcase-heading" className="sr-only">
            Product tour
          </h2>
          <div className="space-y-20 md:space-y-28">
            {SHOWCASE.map((s, i) => (
              <div
                key={s.tag}
                className={`grid grid-cols-1 items-center gap-10 md:grid-cols-2 ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
              >
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--color-brand)]">
                    {s.tag}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-[28px]">
                    {s.title}
                  </h3>
                  <p className="prose-measure mt-3 text-[15px] leading-relaxed text-[var(--color-ink-secondary)]">
                    {s.body}
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-[14px] text-[var(--color-ink)]">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#12B76A1A]">
                          <Check className="size-3 text-[var(--color-positive)]" aria-hidden />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <ShowcaseVisual kind={s.visual} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
        <h2 id="how-heading" className="text-center text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          How it works
        </h2>
        <ol className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            ['Describe', 'Tell ORBIT what you want in plain language. Set price bands, keywords, and how strict to be.'],
            ['ORBIT watches', 'Monitors check your sources on schedule, normalize what they find, and score every match.'],
            ['You decide', 'Review scored opportunities with evidence linked. Shortlist, compare, or dismiss — your pipeline stays organized.'],
          ].map(([title, body], i) => (
            <li key={title} className="relative rounded-xl border border-[var(--color-line)] bg-white p-6 pt-8">
              <span className="tnum absolute -top-4 left-6 grid size-8 place-items-center rounded-full bg-[var(--color-ink)] text-[13px] font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="text-[17px] font-semibold text-[var(--color-ink)]">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Use cases */}
      <section aria-labelledby="usecases-heading" className="border-y border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
          <h2
            id="usecases-heading"
            className="text-center text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]"
          >
            Built for operators who move first
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {USE_CASES.map((u) => (
              <Link
                key={u.title}
                href={u.href}
                className="focus-ring group flex flex-col rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-6 transition-shadow hover:shadow-[var(--shadow-lg)]"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-[var(--color-brand-subtle)] text-[var(--color-brand)]">
                  <u.icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-4 text-[17px] font-semibold text-[var(--color-ink)]">{u.title}</h3>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{u.story}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-medium text-[var(--color-brand)]">
                  Read the workflow
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section aria-label="Capabilities" className="bg-[var(--color-ink)] py-16 md:py-20">
        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-10 px-6 text-center sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="tnum text-4xl font-semibold tracking-[-0.02em] text-white md:text-5xl">{s.value}</p>
              <p className="mt-2 text-[14px] text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials — demo content, structured for real quotes later */}
      <section aria-labelledby="quotes-heading" className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
        <h2 id="quotes-heading" className="sr-only">
          Testimonials
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className={
                t.featured
                  ? 'rounded-xl border border-[var(--color-line)] bg-white p-7 shadow-[var(--shadow-sm)] md:col-span-2 md:p-9'
                  : 'rounded-xl border border-[var(--color-line)] bg-white p-7'
              }
            >
              <blockquote className={t.featured ? 'text-xl font-medium leading-relaxed tracking-[-0.01em] text-[var(--color-ink)]' : 'text-[15px] leading-relaxed text-[var(--color-ink-secondary)]'}>
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4 text-[13px] text-[var(--color-ink-tertiary)]">
                {t.name}, {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section aria-labelledby="cta-heading" className="border-t border-[var(--color-line)] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-20 text-center md:py-28">
          <h2
            id="cta-heading"
            className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-4xl"
          >
            Start finding opportunities today.
          </h2>
          <p className="prose-measure mx-auto mt-4 text-[16px] leading-relaxed text-[var(--color-ink-secondary)]">
            Set up your first monitor in under two minutes. Your workspace starts with sample data so you can see
            exactly how scoring works.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="focus-ring inline-flex h-12 items-center gap-2 rounded-lg bg-[var(--color-ink)] px-6 text-[15px] font-medium text-white hover:opacity-90"
            >
              Start free <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="focus-ring inline-flex h-12 items-center rounded-lg px-4 text-[15px] font-medium text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* Cropped product visuals built from real components (plan §17.4). */
function ShowcaseVisual({ kind }: { kind: 'discover' | 'score' | 'alerts' }) {
  if (kind === 'discover') {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-lg)]">
        <div className="border-b border-[var(--color-line)] p-4">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-3">
            <span className="text-[13px] text-[var(--color-ink-tertiary)]">
              seamaster diver 300m, box &amp; papers, under €4,000
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['Watches', 'Price drop only', 'Chrono24'].map((c, i) => (
              <span
                key={c}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  i === 0 ? 'bg-[var(--color-ink)] text-white' : 'border border-[var(--color-line)] text-[var(--color-ink-secondary)]'
                }`}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          {[1, 2].map((n) => (
            <div key={n} className="overflow-hidden rounded-lg border border-[var(--color-line)]">
              <div
                className="flex aspect-[16/9] items-center justify-center"
                style={{ background: n === 1 ? 'linear-gradient(135deg,#4A1D3F,#EC4899)' : 'linear-gradient(135deg,#12275E,#2E90FA)' }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/85">
                  {n === 1 ? 'Watches' : 'Electronics'}
                </span>
              </div>
              <div className="space-y-1.5 p-3">
                <p className="truncate text-[12px] font-medium">
                  {n === 1 ? 'Omega Seamaster Diver 300M' : 'ThinkPad X1 Carbon G9'}
                </p>
                <p className="tnum text-[13px] font-semibold">{n === 1 ? '€3,850' : '€649'}</p>
                <div className="flex items-center justify-between">
                  <span className="tnum text-[10px] text-[var(--color-positive)]">{n === 1 ? '−7.2%' : '−18.8%'}</span>
                  <span className="tnum rounded-full bg-[#12B76A1A] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-positive)]">
                    {n === 1 ? '82' : '87'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (kind === 'score') {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-lg)]">
        <p className="text-[12px] font-medium text-[var(--color-ink-secondary)]">Omega Seamaster Diver 300M</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="tnum text-2xl font-semibold">€3,850</p>
            <p className="tnum text-[11px] text-[var(--color-ink-tertiary)] line-through">was €4,150</p>
          </div>
          <div className="text-right">
            <p className="tnum text-[13px] font-semibold text-[var(--color-positive)]">−7.2% · below band</p>
            <p className="text-[11px] text-[var(--color-ink-tertiary)]">Reference €4,300 · illustrative</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-surface-subtle)]">
          <div className="h-full w-[82%] rounded-full bg-[var(--color-positive)]" />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-[var(--color-ink-tertiary)]">
          <span>Deal score 82</span>
          <span>Match 91</span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[var(--color-line)] pt-3 text-[12px]">
          {[
            ['Condition', 'Excellent'],
            ['Box & papers', 'Yes'],
            ['Year', '2018'],
            ['Evidence', '2 sources'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-[var(--color-ink-tertiary)]">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-lg)]">
      <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--color-ink-tertiary)]">
        <span className="size-2 animate-pulse rounded-full bg-[var(--color-brand)]" />
        Alert feed
      </p>
      <ul className="mt-3 space-y-2.5">
        {[
          ['Price drop', 'Omega Seamaster — €4,150 → €3,850 (−7.2%)', '12 min ago'],
          ['New match', 'Porsche 997 OEM headlight, NOS', '1 h ago'],
          ['Availability', 'ThinkPad X1 Carbon back in stock', '3 h ago'],
          ['Price drop', 'Eames Lounge & Ottoman — second cut', '1 d ago'],
        ].map(([type, body, when]) => (
          <li key={body} className="flex items-start gap-3 rounded-lg border border-[var(--color-line)] p-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--color-brand-subtle)]">
              <Bell className="size-3.5 text-[var(--color-brand)]" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--color-brand)]">
                {type}
              </span>
              <span className="block truncate text-[13px] font-medium text-[var(--color-ink)]">{body}</span>
              <span className="block text-[11px] text-[var(--color-ink-tertiary)]">{when}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--color-ink-tertiary)]">
        <LineChart className="size-3.5" aria-hidden /> Monitors checked 40 sources in the last hour
      </p>
    </div>
  );
}
