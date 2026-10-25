import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms for using ORBIT Intelligence — accounts, plans, estimates, and acceptable use.',
  alternates: { canonical: '/terms' },
};

const UPDATED = '25 October 2026';

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-[760px] px-6 py-16 md:py-20">
      <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-4xl">Terms of Service</h1>
      <p className="mt-2 text-[13px] text-[var(--color-ink-tertiary)]">Last updated {UPDATED}</p>

      <div className="prose-orbit space-y-6">
        <section>
          <h2>1. The service</h2>
          <p>
            ORBIT Intelligence is a platform that monitors web sources for opportunities you describe, scores
            matches, and notifies you. The current build operates on curated sample data; live source crawling
            activates with the production backend.
          </p>
        </section>
        <section>
          <h2>2. Your account</h2>
          <p>
            You are responsible for activity under your account and for keeping your credentials safe. One account
            per person; workspace sharing arrives with team plans.
          </p>
        </section>
        <section>
          <h2>3. Plans and billing</h2>
          <p>
            The Free plan (3 monitors) is free. Paid plans (Pro €99/mo, Scale €249/mo) activate with billing at
            launch; this build collects waitlist signups and never asks for payment details. Prices are in EUR
            including VAT where applicable. You can cancel at any time; access continues to the end of the period.
          </p>
        </section>
        <section>
          <h2>4. Estimates, not advice</h2>
          <p>
            All reference values, deal scores, yields and similar figures are illustrative estimates. ORBIT does
            not provide investment, legal, tax or appraisal advice, and nothing in the product guarantees any
            outcome or return. Verify every listing on its source before acting.
          </p>
        </section>
        <section>
          <h2>5. Acceptable use</h2>
          <p>
            Use ORBIT lawfully. Do not attempt to scrape ORBIT itself, abuse rate limits, or use the service to
            infringe the rights of others. We may suspend accounts that do.
          </p>
        </section>
        <section>
          <h2>6. Data</h2>
          <p>
            Your workspace data is yours — export it anytime. We do not sell personal data. See the Privacy Policy
            for details.
          </p>
        </section>
        <section>
          <h2>7. Liability</h2>
          <p>
            The service is provided &quot;as is&quot;. To the maximum extent permitted by law, ORBIT is not liable
            for indirect or consequential damages, including missed opportunities or decisions made on the basis of
            estimates the product displays.
          </p>
        </section>
        <section>
          <h2>8. Changes</h2>
          <p>
            We may update these terms; material changes are announced in the app before they take effect. This is
            an honest template for the launch build — have counsel review before production use.
          </p>
        </section>
      </div>
    </article>
  );
}
