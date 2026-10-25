'use client';

/* Contact form (plan §21): Zod-validated server action → contact_messages
   insert → success state. Right column: response-time + mailto. */
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CircleAlert, MailCheck } from 'lucide-react';
import { contactAction, type MutationResult } from '@/lib/actions/app';

const TOPICS = [
  { value: 'sales', label: 'Sales — plans and onboarding' },
  { value: 'support', label: 'Support — help with the product' },
  { value: 'partnership', label: 'Partnership — sources and integrations' },
  { value: 'press', label: 'Press — story and data requests' },
];

export function ContactView() {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = React.useActionState<MutationResult | null, FormData>(contactAction, null);
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (state?.ok) setSent(true);
  }, [state]);

  const defaultTopic = TOPICS.some((t) => t.value === searchParams.get('topic'))
    ? searchParams.get('topic')!
    : 'support';

  const inputCls =
    'focus-ring h-11 w-full rounded-lg border border-[var(--color-line)] bg-white px-3.5 text-sm placeholder:text-[var(--color-ink-tertiary)]';

  if (sent) {
    return (
      <div className="mx-auto max-w-[560px] px-6 py-16 md:py-24">
        <div className="rounded-xl border border-[var(--color-line)] bg-white p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#12B76A1A] text-[var(--color-positive)]">
            <MailCheck className="size-6" strokeWidth={1.75} aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Message received
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-[var(--color-ink-secondary)]">
            Thanks for reaching out. We reply to every message — typically within one business day, faster if
            it&apos;s about a listing that expires tonight.
          </p>
          <Link
            href="/"
            className="focus-ring mt-6 inline-flex h-10 items-center rounded-lg border border-[var(--color-line-strong)] px-4 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-6 py-16 md:py-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-4xl">Contact us</h1>
        <p className="prose-measure mt-3 text-[16px] leading-relaxed text-[var(--color-ink-secondary)]">
          Sales, support, partnerships or press — one form, one inbox, real humans.
        </p>

        <form action={formAction} className="mt-8 space-y-4" noValidate>
          {state?.error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-[#F0443833] bg-[#F044380D] px-3.5 py-2.5 text-[13px] text-[color:var(--color-negative)]">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{state.error}</span>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="c-name" className="block text-[13px] font-medium text-[var(--color-ink)]">
                Name <span className="text-[color:var(--color-negative)]">*</span>
              </label>
              <input id="c-name" name="name" required placeholder="Your name" className={inputCls} aria-invalid={Boolean(state?.fieldErrors?.name)} />
              {state?.fieldErrors?.name && <p className="text-xs text-[color:var(--color-negative)]">{state.fieldErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="c-email" className="block text-[13px] font-medium text-[var(--color-ink)]">
                Email <span className="text-[color:var(--color-negative)]">*</span>
              </label>
              <input id="c-email" name="email" type="email" required placeholder="you@example.com" className={inputCls} aria-invalid={Boolean(state?.fieldErrors?.email)} />
              {state?.fieldErrors?.email && <p className="text-xs text-[color:var(--color-negative)]">{state.fieldErrors.email}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="c-company" className="block text-[13px] font-medium text-[var(--color-ink)]">
              Company <span className="font-normal text-[var(--color-ink-tertiary)]">(optional)</span>
            </label>
            <input id="c-company" name="company" placeholder="Company or team" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="c-topic" className="block text-[13px] font-medium text-[var(--color-ink)]">
              Topic
            </label>
            <select id="c-topic" name="topic" defaultValue={defaultTopic} className={inputCls}>
              {TOPICS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="c-message" className="block text-[13px] font-medium text-[var(--color-ink)]">
              Message <span className="text-[color:var(--color-negative)]">*</span>
            </label>
            <textarea
              id="c-message"
              name="message"
              required
              rows={6}
              placeholder="Tell us what you're hunting for, or what's on your mind…"
              className="focus-ring w-full rounded-lg border border-[var(--color-line)] bg-white px-3.5 py-3 text-sm placeholder:text-[var(--color-ink-tertiary)]"
              aria-invalid={Boolean(state?.fieldErrors?.message)}
            />
            {state?.fieldErrors?.message && <p className="text-xs text-[color:var(--color-negative)]">{state.fieldErrors.message}</p>}
          </div>
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="focus-ring inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--color-ink)] px-5 text-[15px] font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
            {pending ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>

      <aside className="space-y-6 lg:pt-[76px]">
        <div className="rounded-xl border border-[var(--color-line)] bg-white p-6">
          <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">Response time</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">
            One business day for sales and support; faster if you mention a listing that expires soon.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-white p-6">
          <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">Email us directly</h2>
          <a
            href="mailto:hello@orbit-intelligence.example"
            className="focus-ring mt-1.5 inline-block rounded text-[14px] font-medium text-[color:var(--color-brand)] hover:underline"
          >
            hello@orbit-intelligence.example
          </a>
          <p className="mt-1 text-[12px] text-[var(--color-ink-tertiary)]">
            Placeholder address for this build — wire your real inbox in <code>components/marketing/contact-view.tsx</code>.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-white p-6">
          <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">More to read</h2>
          <ul className="mt-2 space-y-1.5 text-[14px]">
            {[
              ['How deal scoring works', '/blog/how-deal-scoring-works'],
              ['Monitoring Berlin real estate', '/blog/monitoring-berlin-real-estate'],
              ['Pricing & plans', '/pricing'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="focus-ring rounded text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] hover:underline">
                  {label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
