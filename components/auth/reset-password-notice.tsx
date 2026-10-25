'use client';

/* Reset password: local accounts are reset by the operator; the page explains
   this honestly instead of faking a token flow (plan §4 honesty rules). */
import Link from 'next/link';
import { KeyRound } from 'lucide-react';

export function ResetPasswordNotice() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Choose a new password</h1>
      <div className="mt-6 space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--color-surface-subtle)] px-4 py-3.5">
          <KeyRound className="mt-0.5 size-4.5 shrink-0 text-[var(--text-muted)]" aria-hidden />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Password reset links go live at launch</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
              This build runs on a local workspace without an email delivery service, so reset links
              can&apos;t be generated yet. If you manage this deployment, reset a local account with{' '}
              <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[12px]">
                npm run reset-password -- you@example.com
              </code>
              .
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="focus-ring inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-medium text-white hover:opacity-90"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
