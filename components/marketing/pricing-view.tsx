'use client';

/* Pricing (plan §20): monthly/annual toggle, 3 tiers, comparison table,
   FAQ accordion, honest waitlist modal (never a fake payment form). */
import * as React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { SmoothAccordion } from '@/components/easyui/SmoothAccordion';
import { Modal } from '@/components/ui/modal';
import { joinWaitlistAction } from '@/lib/actions/app';
import { toastError } from '@/components/ui/toast-helpers';
import { cn } from '@/lib/easyui/utils';

const TIERS = [
  {
    code: 'free',
    name: 'Free',
    monthly: 0,
    tagline: 'For your first hunts',
    cta: 'Start free',
    featured: false,
    features: ['3 monitors', 'Daily refresh', '2 collections', '30-day price history', 'In-app alerts', 'Compare 2 items'],
  },
  {
    code: 'pro',
    name: 'Pro',
    monthly: 99,
    tagline: 'For serious operators',
    cta: 'Choose Pro',
    featured: true,
    features: ['20 monitors', '30-minute refresh', 'Unlimited collections', '1-year price history', 'In-app + email alerts', 'Compare 4 items', 'Market insights'],
  },
  {
    code: 'scale',
    name: 'Scale',
    monthly: 249,
    tagline: 'For teams and pros',
    cta: 'Choose Scale',
    featured: false,
    features: ['100 monitors', '5-minute refresh', 'Unlimited collections', '2-year price history', 'In-app + email + webhook alerts', 'Compare 4 items', 'Priority support', 'API access (coming soon)'],
  },
] as const;

const COMPARISON: Array<{ group: string; rows: Array<{ label: string; free: string; pro: string; scale: string }> }> = [
  {
    group: 'Discovery',
    rows: [
      { label: 'Natural-language search', free: '✓', pro: '✓', scale: '✓' },
      { label: 'Saved searches', free: '✓', pro: '✓', scale: '✓' },
      { label: 'Deal scores & reference bands', free: '✓', pro: '✓', scale: '✓' },
      { label: 'Market insights', free: '—', pro: '✓', scale: '✓' },
    ],
  },
  {
    group: 'Monitoring',
    rows: [
      { label: 'Monitors', free: '3', pro: '20', scale: '100' },
      { label: 'Refresh frequency', free: 'Daily', pro: '30 min', scale: '5 min' },
      { label: 'Price-drop-only mode', free: '✓', pro: '✓', scale: '✓' },
      { label: 'Price history retention', free: '30 days', pro: '1 year', scale: '2 years' },
    ],
  },
  {
    group: 'Organization',
    rows: [
      { label: 'Collections', free: '2', pro: 'Unlimited', scale: 'Unlimited' },
      { label: 'Comparison size', free: '2 items', pro: '4 items', scale: '4 items' },
      { label: 'Pipeline statuses & bulk actions', free: '✓', pro: '✓', scale: '✓' },
    ],
  },
  {
    group: 'Alerts & support',
    rows: [
      { label: 'In-app alerts', free: '✓', pro: '✓', scale: '✓' },
      { label: 'Email alerts', free: '—', pro: '✓', scale: '✓' },
      { label: 'Webhook alerts', free: '—', pro: '—', scale: '✓' },
      { label: 'Support', free: 'Community', pro: 'Email', scale: 'Priority' },
    ],
  },
];

const FAQ = [
  { q: 'Is there a trial of the paid plans?', a: 'Every account starts on the Free plan with 3 monitors and full functionality — no time limit. Paid plans activate with billing at launch; join the waitlist to be first in line.' },
  { q: 'Where does ORBIT get its data?', a: 'This build runs on curated sample data so you can evaluate the full workflow honestly. The production crawler connects live marketplace sources (Amazon, eBay, Chrono24, ImmobilienScout24 and more) — the app’s data layer is built for that swap.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Monthly plans, no lock-in. Your data export is one click in Settings.' },
  { q: 'Are the estimated values real appraisals?', a: 'No. Reference values and yields are illustrative estimates computed from tracked observations and public data. They are clearly labeled in the product and never guarantee investment returns.' },
  { q: 'Do you support teams?', a: 'Scale is built for small teams and sourcing operations; shared workspaces arrive with billing at launch.' },
  { q: 'Is there an API?', a: 'A read API is planned for Scale as the crawler goes live. Join the waitlist and tell us what you’d build.' },
];

export function PricingView() {
  const [annual, setAnnual] = React.useState(false);
  const [waitlistFor, setWaitlistFor] = React.useState<string | null>(null);

  const price = (monthly: number) => (annual ? Math.round(monthly * (10 / 12)) : monthly);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
          Pricing that pays for itself
        </h1>
        <p className="prose-measure mx-auto mt-4 text-[16px] leading-relaxed text-[var(--color-ink-secondary)] md:text-[17px]">
          A single missed opportunity costs more than a year of subscription. Start free, upgrade when the monitors
          earn it.
        </p>

        {/* Billing toggle */}
        <div className="mt-8 inline-flex items-center gap-3" role="group" aria-label="Billing period">
          <span className={cn('text-[14px] font-medium', !annual ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-tertiary)]')}>Monthly</span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            aria-label="Annual billing (2 months free)"
            onClick={() => setAnnual((a) => !a)}
            className={cn(
              'focus-ring relative h-7 w-12 rounded-full transition-colors',
              annual ? 'bg-[var(--color-ink)]' : 'bg-[var(--color-line-strong)]'
            )}
          >
            <span
              className={cn(
                'absolute top-1 size-5 rounded-full bg-white transition-transform',
                annual ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
          <span className={cn('text-[14px] font-medium', annual ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-tertiary)]')}>
            Annual
          </span>
          <span className="rounded-full bg-[color:var(--color-brand-subtle)] px-2 py-0.5 text-[12px] font-semibold text-[color:var(--color-brand)]">
            2 months free
          </span>
        </div>
      </div>

      {/* Tier cards */}
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.code}
            className={cn(
              'relative flex flex-col rounded-2xl border bg-white p-7',
              tier.featured ? 'border-[color:var(--color-brand)] shadow-[var(--shadow-lg)]' : 'border-[var(--color-line)]'
            )}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--color-brand)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-white">
                Most popular
              </span>
            )}
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)]">{tier.name}</h2>
            <p className="mt-0.5 text-[13px] text-[var(--color-ink-tertiary)]">{tier.tagline}</p>
            <p className="tnum mt-5 flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                €{price(tier.monthly)}
              </span>
              <span className="text-[13px] text-[var(--color-ink-tertiary)]">/ month</span>
            </p>
            {tier.monthly > 0 && (
              <p className="mt-1 text-[12px] text-[var(--color-ink-tertiary)]">
                {annual ? 'Billed annually — 2 months free' : 'Billed monthly'}
              </p>
            )}
            <ul className="mt-6 flex-1 space-y-2.5">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[14px] text-[var(--color-ink-secondary)]">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-positive)]" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            {tier.code === 'free' ? (
              <Link
                href="/signup"
                className="focus-ring mt-7 inline-flex h-11 items-center justify-center rounded-lg border border-[var(--color-line-strong)] text-[15px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]"
              >
                Start free
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setWaitlistFor(tier.name)}
                className={cn(
                  'focus-ring mt-7 inline-flex h-11 items-center justify-center rounded-lg text-[15px] font-medium',
                  tier.featured
                    ? 'bg-[var(--color-ink)] text-white hover:opacity-90'
                    : 'border border-[var(--color-line-strong)] text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]'
                )}
              >
                {tier.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <section aria-labelledby="compare-heading" className="mt-20">
        <h2 id="compare-heading" className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          Compare plans
        </h2>
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-line)] bg-white">
          <table className="w-full min-w-[42rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)]">
                <th scope="col" className="h-11 px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--color-ink-tertiary)]">
                  Capability
                </th>
                {['Free', 'Pro', 'Scale'].map((h) => (
                  <th key={h} scope="col" className="h-11 px-4 text-center text-[13px] font-semibold text-[var(--color-ink)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((group) => (
                <React.Fragment key={group.group}>
                  <tr>
                    <th scope="colgroup" colSpan={4} className="border-b border-[var(--color-line)] bg-[var(--color-canvas)] px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-ink-tertiary)]">
                      {group.group}
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.label} className="border-b border-[var(--color-line)] last:border-b-0">
                      <th scope="row" className="h-11 px-4 text-left text-[14px] font-medium text-[var(--color-ink-secondary)]">
                        {row.label}
                      </th>
                      {[row.free, row.pro, row.scale].map((v, i) => (
                        <td key={i} className="h-11 px-4 text-center text-[14px] text-[var(--color-ink)]">
                          {v === '✓' ? (
                            <Check className="mx-auto size-4 text-[var(--color-positive)]" aria-label="Included" />
                          ) : v === '—' ? (
                            <span className="text-[var(--color-ink-tertiary)]">—</span>
                          ) : (
                            v
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="pricing-faq" className="mx-auto mt-20 max-w-[760px]">
        <h2 id="pricing-faq" className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          Pricing FAQ
        </h2>
        <div className="mt-6">
          <SmoothAccordion
            items={FAQ.map((f, i) => ({
              id: `pricing-faq-${i}`,
              title: f.q,
              content: <p className="text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{f.a}</p>,
            }))}
            allowMultiple
          />
        </div>
      </section>

      <p className="mt-14 text-center text-[13px] text-[var(--color-ink-tertiary)]">
        Prices in EUR, incl. VAT where applicable. Estimated values shown in the product are illustrative.
      </p>

      <WaitlistModal planName={waitlistFor} onClose={() => setWaitlistFor(null)} />
    </div>
  );
}

function WaitlistModal({ planName, onClose }: { planName: string | null; onClose: () => void }) {
  const [email, setEmail] = React.useState('');
  const [done, setDone] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (planName) setDone(false);
  }, [planName]);

  return (
    <Modal
      open={planName !== null}
      onClose={onClose}
      title={done ? 'You’re on the waitlist' : 'Billing goes live at launch'}
      description={
        done
          ? undefined
          : `${planName} is ready to activate the moment checkout ships. Join the waitlist and we’ll email you — no payment details now or later in this build.`
      }
    >
      {done ? (
        <p className="text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">
          Thanks — we&apos;ll reach out at <span className="font-medium text-[var(--color-ink)]">{email}</span> when
          billing is live. Your Free plan keeps working in the meantime.
        </p>
      ) : (
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const fd = new FormData();
            fd.set('email', email);
            const res = await joinWaitlistAction(null, fd);
            setPending(false);
            if (!res.ok) { toastError(res.error ?? 'Could not join waitlist'); return; }
            setDone(true);
          }}
        >
          <label htmlFor="pricing-waitlist-email" className="block text-[13px] font-medium">
            Email
          </label>
          <input
            id="pricing-waitlist-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="focus-ring h-10 w-full rounded-lg border border-[var(--color-line)] bg-white px-3.5 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="focus-ring inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--color-ink)] text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Joining…' : 'Join billing waitlist'}
          </button>
        </form>
      )}
    </Modal>
  );
}
