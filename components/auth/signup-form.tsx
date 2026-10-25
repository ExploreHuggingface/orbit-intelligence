'use client';

import * as React from 'react';
import Link from 'next/link';
import { CircleAlert } from 'lucide-react';
import { signUpAction, type ActionState } from '@/lib/actions/auth';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Field, FormAlert, PasswordInput, SubmitButton, inputClass } from '@/components/auth/form-parts';

export function SignupForm() {
  const [state, formAction, pending] = React.useActionState<ActionState, FormData>(signUpAction, {});
  const [accepted, setAccepted] = React.useState(false);
  const { t } = useI18n();

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <LanguageSelector variant="light" />
      </div>
      <h1 className="text-xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{t('auth.createWorkspace')}</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        {t('auth.signUpSubtitle')}
      </p>

      <form action={formAction} className="mt-6 space-y-4" noValidate>
        {state.error && (
          <FormAlert>
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{state.error}</span>
          </FormAlert>
        )}
        <Field label={t('auth.fullName')} htmlFor="full_name" error={state.fieldErrors?.full_name}>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            placeholder="Alex Investor"
            className={inputClass}
          />
        </Field>
        <Field label={t('auth.email')} htmlFor="email" error={state.fieldErrors?.email}>
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
        <Field
          label={t('auth.password')}
          htmlFor="password"
          error={state.fieldErrors?.password}
          hint={t('auth.passwordHint')}
        >
          <PasswordInput id="password" name="password" autoComplete="new-password" placeholder="Create a password" />
        </Field>
        <div className="space-y-1.5">
          <label className="flex items-start gap-2.5 text-[13px] text-[var(--text-secondary)]">
            <input
              type="checkbox"
              name="accept_terms"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 size-4 rounded border-[var(--border)] accent-[var(--accent)]"
            />
            <span>
              I accept the{' '}
              <Link href="/terms" className="text-[color:var(--color-brand)] hover:underline">
                {t('auth.terms')}
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[color:var(--color-brand)] hover:underline">
                {t('auth.privacy')}
              </Link>
              .
            </span>
          </label>
          {state.fieldErrors?.accept_terms && (
            <p className="text-xs text-[color:var(--color-negative)]" role="alert">
              {state.fieldErrors.accept_terms}
            </p>
          )}
        </div>
        <SubmitButton pending={pending} pendingLabel={t('auth.creatingWorkspace')}>
          {t('auth.startFreeCta')}
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-[13px] text-[var(--text-muted)]">
        {t('auth.haveAccount')}{' '}
        <Link href="/login" className="font-medium text-[color:var(--color-brand)] hover:underline">
          {t('common.signIn')}
        </Link>
      </p>
    </div>
  );
}
