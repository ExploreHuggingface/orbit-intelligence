'use client';

/* Shared form field styles for auth pages. */
import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/easyui/utils';

export const inputClass =
  'focus-ring h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]';

export function Field({
  label,
  htmlFor,
  error,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-[var(--text-primary)]">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-[color:var(--color-negative)]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function PasswordInput({
  id,
  name,
  placeholder,
  autoComplete,
  required = true,
  error,
}: {
  id: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
}) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputClass, 'pr-11', error && 'border-[color:var(--color-negative)]')}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="focus-ring absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
}

export function SubmitButton({
  pending,
  children,
  pendingLabel = 'Working…',
}: {
  pending: boolean;
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && (
        <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}

export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-[#F0443833] bg-[#F044380D] px-3.5 py-2.5 text-[13px] text-[color:var(--color-negative)]"
    >
      {children}
    </div>
  );
}
