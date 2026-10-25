import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ORBIT Intelligence handles your data: what we collect, why, and the controls you have.',
  alternates: { canonical: '/privacy' },
};

const UPDATED = '25 October 2026';

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-[760px] px-6 py-16 md:py-20">
      <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] md:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-[13px] text-[var(--color-ink-tertiary)]">Last updated {UPDATED}</p>

      <div className="prose-orbit space-y-6">
        <section>
          <h2>1. Who we are</h2>
          <p>
            ORBIT Intelligence (&quot;ORBIT&quot;, &quot;we&quot;) operates an internet-intelligence platform that helps
            you monitor marketplaces and the web for opportunities. This policy explains what data we process, why,
            and the choices you have.
          </p>
        </section>
        <section>
          <h2>2. Data we collect</h2>
          <ul>
            <li>
              <strong>Account data:</strong> name, email address, and password (stored only as a salted
              cryptographic hash). Account records and workspace content (monitors, opportunities you create,
              collections, notification read state, settings) live in a dedicated Postgres database hosted by
              Supabase in the EU.
            </li>
            <li>
              <strong>Usage data:</strong> product events such as monitors created and searches saved, kept in your
              workspace activity log. We do not run third-party advertising or tracking pixels.
            </li>
            <li>
              <strong>Contact messages:</strong> if you use the contact form, we store the message to reply to you.
            </li>
          </ul>
        </section>
        <section>
          <h2>3. How we use data</h2>
          <p>
            To operate your account, run your monitors, deliver your notifications, and improve the product. We do
            not sell your personal data, and we do not share it with data brokers. Emails are transactional only
            (alerts you asked for, and account messages).
          </p>
        </section>
        <section>
          <h2>4. Estimates and disclaimers</h2>
          <p>
            Reference values, deal scores and yield computations shown in the product are illustrative estimates
            derived from tracked observations and public data. They are not appraisals, financial advice, or a
            guarantee of any investment return.
          </p>
        </section>
        <section>
          <h2>5. Cookies</h2>
          <p>
            We set one essential cookie for your signed-in session. No advertising cookies, no third-party trackers.
            Local UI preferences (like sidebar collapse) are stored in your browser under the &quot;orbit.ui&quot;
            key and never leave your device.
          </p>
        </section>
        <section>
          <h2>6. Your controls</h2>
          <ul>
            <li>Export all your workspace data as JSON at any time from Settings → Data.</li>
            <li>Reset or delete workspace content at any time.</li>
            <li>Request account deletion by contacting us — we remove account data within 30 days.</li>
          </ul>
        </section>
        <section>
          <h2>7. Security</h2>
          <p>
            Passwords are hashed with scrypt; sessions are signed HTTP-only cookies. Database access is governed by
            row-level security so accounts can only read their own rows.
          </p>
        </section>
        <section>
          <h2>8. Changes</h2>
          <p>
            If this policy changes materially, we will notify signed-in users in the app before it takes effect.
            This is an honest template for the launch build — have counsel review before production use.
          </p>
        </section>
      </div>
    </article>
  );
}
