'use client';

import * as React from 'react';
import Link from 'next/link';
import { signInAction, type ActionState } from '@/lib/actions/auth';
import { Field, FormAlert, PasswordInput, SubmitButton, inputClass } from '@/components/auth/form-parts';
import { CircleAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSelector } from '@/components/ui/language-selector';

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [state, formAction, pending] = React.useActionState<ActionState, FormData>(signInAction, {});
  const { t } = useI18n();

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <LanguageSelector variant="light" />
      </div>
      <h1 className="text-xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{t('auth.welcomeBack')}</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{t('auth.signInSubtitle')}</p>

      <form action={formAction} className="mt-6 space-y-4" noValidate>
        <input type="hidden" name="next" value={nextPath ?? ''} />
        {state.error && (
          <FormAlert>
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{state.error}</span>
          </FormAlert>
        )}
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
        <Field label={t('auth.password')} htmlFor="password" error={state.fieldErrors?.password}>
          <PasswordInput id="password" name="password" autoComplete="current-password" placeholder="Your password" />
        </Field>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="focus-ring rounded text-[13px] text-[color:var(--color-brand)] hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </div>
        <SubmitButton pending={pending} pendingLabel={t('auth.signingIn')}>
          {t('auth.signInCta')}
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-[13px] text-[var(--text-muted)]">
        {t('auth.newToOrbit')}{' '}
        <Link href="/signup" className="font-medium text-[color:var(--color-brand)] hover:underline">
          {t('common.signUp')}
        </Link>
      </p>
    </div>
  );
}
