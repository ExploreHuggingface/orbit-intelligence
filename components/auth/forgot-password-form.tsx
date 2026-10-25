'use client';

import * as React from 'react';
import Link from 'next/link';
import { CircleAlert, MailCheck } from 'lucide-react';
import { forgotPasswordAction, type ActionState } from '@/lib/actions/auth';
import { Field, FormAlert, SubmitButton, inputClass } from '@/components/auth/form-parts';

export function ForgotPasswordForm() {
  const [state, formAction, pending] = React.useActionState<ActionState, FormData>(forgotPasswordAction, {});

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Reset your password</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Enter your email and we&apos;ll send reset instructions.
      </p>

      {state.ok ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-[#12B76A33] bg-[#12B76A0D] px-4 py-3.5">
            <MailCheck className="mt-0.5 size-4.5 shrink-0 text-[color:var(--color-positive)]" aria-hidden />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Check your inbox</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
                If an account exists for this address, password reset instructions are on their way.
                Email delivery goes live at launch — until then, contact us at{' '}
                <a href="mailto:support@orbit-intelligence.example" className="text-[color:var(--color-brand)] hover:underline">
                  support
                </a>{' '}
                if you&apos;re locked out of a local demo account.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="focus-ring inline-flex h-10 w-full items-center justify-center rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form action={formAction} className="mt-6 space-y-4" noValidate>
          {state.error && (
            <FormAlert>
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{state.error}</span>
            </FormAlert>
          )}
          <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </Field>
          <SubmitButton pending={pending} pendingLabel="Sending…">
            Send reset instructions
          </SubmitButton>
        </form>
      )}

      <p className="mt-6 text-center text-[13px] text-[var(--text-muted)]">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-[color:var(--color-brand)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
