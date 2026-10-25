'use client';

/* Monitor create/edit — 4-step wizard (plan §28): Define → Criteria →
   Notifications → Review. State preserved between steps; Zod-backed server
   action with field errors surfaced per step. */
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, X } from 'lucide-react';
import { Stepper } from '@/components/easyui/stepper';
import { Button } from '@/components/easyui/Button';
import { StretchSwitch } from '@/components/easyui/StretchSwitch';
import { FormAlert } from '@/components/auth/form-parts';
import { Modal } from '@/components/ui/modal';
import { createMonitorAction, updateMonitorAction, type MutationResult } from '@/lib/actions/app';
import { CATEGORIES, CATEGORY_LABELS, type Category, type Monitor, type MonitorSensitivity } from '@/lib/types';
import { cn } from '@/lib/easyui/utils';

const SENSITIVITIES: Array<{ value: MonitorSensitivity; label: string; hint: string }> = [
  { value: 'broad', label: 'Broad', hint: 'More matches, including loose ones — good for rare items.' },
  { value: 'balanced', label: 'Balanced', hint: 'Matches that fit most of your criteria.' },
  { value: 'strict', label: 'Strict', hint: 'Only strong matches — every criterion must fit.' },
];

const FREQUENCIES = [
  { value: 1440, label: 'Daily' },
  { value: 60, label: 'Hourly' },
  { value: 30, label: 'Every 30 minutes' },
  { value: 5, label: 'Every 5 minutes' },
];

export interface MonitorFormProps {
  mode?: 'create' | 'edit';
  monitor?: Monitor | null;
  defaultCategory?: Category;
  defaultDescription?: string;
  defaultName?: string;
  compact?: boolean;
  onCreated?: () => void;
  onCancel?: () => void;
  openInModal?: boolean;
  planMonitorLimit?: number;
  activeMonitors?: number;
  planName?: string;
}

interface FormState {
  name: string;
  description: string;
  category: Category;
  sensitivity: MonitorSensitivity;
  frequency_minutes: number;
  price_min: string;
  price_max: string;
  keywords: string;
  excluded_terms: string;
  domain_restriction: string;
  notify_in_app: boolean;
  digest_mode: boolean;
  price_drop_only: boolean;
}

function stateFromMonitor(m: Monitor | null | undefined, props: MonitorFormProps): FormState {
  if (m) {
    return {
      name: m.name,
      description: m.description,
      category: m.category,
      sensitivity: m.sensitivity,
      frequency_minutes: m.frequency_minutes,
      price_min: m.criteria.price_min != null ? String(m.criteria.price_min) : '',
      price_max: m.criteria.price_max != null ? String(m.criteria.price_max) : '',
      keywords: m.criteria.keywords.join(', '),
      excluded_terms: m.criteria.excluded_terms.join(', '),
      domain_restriction: m.criteria.domain_restriction ?? '',
      notify_in_app: m.notify_in_app,
      digest_mode: m.digest_mode,
      price_drop_only: m.price_drop_only,
    };
  }
  return {
    name: props.defaultName ?? '',
    description: props.defaultDescription ?? '',
    category: props.defaultCategory ?? 'real_estate',
    sensitivity: 'balanced',
    frequency_minutes: 30,
    price_min: '',
    price_max: '',
    keywords: '',
    excluded_terms: '',
    domain_restriction: '',
    notify_in_app: true,
    digest_mode: false,
    price_drop_only: false,
  };
}

export function MonitorForm(props: MonitorFormProps) {
  const {
    mode = 'create',
    monitor,
    compact = false,
    onCreated,
    onCancel,
    openInModal = true,
    planMonitorLimit = 3,
    activeMonitors = 0,
    planName = 'Free',
  } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = React.useState(0);
  const [state, setState] = React.useState<FormState>(() => stateFromMonitor(monitor, props));
  const [result, formAction, pending] = React.useActionState<MutationResult | null, FormData>(
    mode === 'edit' ? updateMonitorAction : createMonitorAction,
    null
  );
  const [serverFieldErrors, setServerFieldErrors] = React.useState<Record<string, string>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- read via setDismissed flow below
  const [dismissed, setDismissed] = React.useState(false);

  const limitReached = mode === 'create' && planMonitorLimit >= 0 && activeMonitors >= planMonitorLimit;
  const fieldErrors = { ...serverFieldErrors, ...(result?.fieldErrors ?? {}) };

  const prefill = searchParams.get('prefill');
  React.useEffect(() => {
    if (prefill && mode === 'create') {
      setState((s) => ({
        ...s,
        name: prefill.slice(0, 70),
        description: s.description || `Watch for listings matching: ${prefill}`,
      }));
    }
  }, [prefill, mode]);

  const steps = [
    { title: 'Define', description: 'What to watch' },
    { title: 'Criteria', description: 'Filters & sensitivity' },
    { title: 'Notifications', description: 'How to alert you' },
    { title: 'Review', description: 'Confirm & activate' },
  ];

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const stepValid = (i: number): boolean => {
    if (i === 0) return state.description.trim().length >= 10;
    return true;
  };

  // Auto-advance step visibility of server errors: map to relevant step.
  React.useEffect(() => {
    if (result && !result.ok && result.fieldErrors) {
      setServerFieldErrors(result.fieldErrors);
      if (result.fieldErrors.description || result.fieldErrors.category) setStep(0);
      else if (result.fieldErrors.price_min || result.fieldErrors.price_max || result.fieldErrors.keywords || result.fieldErrors.sensitivity) setStep(1);
    }
  }, [result]);

  React.useEffect(() => {
    if (result?.ok) {
      onCreated?.();
      router.refresh();
    }
  }, [result, onCreated, router]);

  const submitForm = () => {
    const fd = new FormData();
    if (mode === 'edit' && monitor) fd.set('id', monitor.id);
    fd.set('name', state.name || state.description.slice(0, 60));
    fd.set('description', state.description);
    fd.set('category', state.category);
    fd.set('sensitivity', state.sensitivity);
    fd.set('frequency_minutes', String(state.frequency_minutes));
    fd.set('price_min', state.price_min);
    fd.set('price_max', state.price_max);
    fd.set('keywords', state.keywords);
    fd.set('excluded_terms', state.excluded_terms);
    fd.set('domain_restriction', state.domain_restriction);
    fd.set('notify_in_app', state.notify_in_app ? 'on' : 'off');
    fd.set('digest_mode', state.digest_mode ? 'on' : 'off');
    fd.set('price_drop_only', state.price_drop_only ? 'on' : 'off');
    formAction(fd);
  };

  const body = (
    <div className={cn('space-y-5', compact && 'space-y-4')}>
      <Stepper steps={steps} current={step} onStepChange={(i) => i < step && setStep(i)} />

      {limitReached && (
        <FormAlert>
          <span>
            Your {planName} plan allows {planMonitorLimit} monitors ({activeMonitors} active).{' '}
            <a href="/app/settings?tab=plan" className="font-medium underline">
              Upgrade to add more
            </a>
            .
          </span>
        </FormAlert>
      )}

      {result && !result.ok && result.error && (
        <FormAlert>
          <span>{result.error}</span>
          <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss" className="ml-auto shrink-0 opacity-60 hover:opacity-100">
            <X className="size-3.5" />
          </button>
        </FormAlert>
      )}

      {step === 0 && (
        <fieldset className="space-y-4" disabled={limitReached}>
          <div className="space-y-1.5">
            <label htmlFor="mon-desc" className="block text-[13px] font-medium">
              Describe the opportunity <span className="text-[color:var(--color-negative)]">*</span>
            </label>
            <textarea
              id="mon-desc"
              rows={compact ? 3 : 4}
              value={state.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="e.g. Apartments in Berlin-Friedrichshain under €350k, vacant or expiring tenancy, yield above 5.5%"
              aria-invalid={Boolean(fieldErrors.description)}
              className={cn(
                'focus-ring w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm placeholder:text-[var(--text-subtle)]',
                fieldErrors.description && 'border-[color:var(--color-negative)]'
              )}
            />
            <p className={cn('text-xs', fieldErrors.description ? 'text-[color:var(--color-negative)]' : 'text-[var(--text-muted)]')}>
              {fieldErrors.description ??
                'Plain language works best — location, condition, attributes that matter. Minimum 10 characters.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="mon-cat" className="block text-[13px] font-medium">
                Category
              </label>
              <select
                id="mon-cat"
                value={state.category}
                onChange={(e) => set('category', e.target.value as Category)}
                className="focus-ring h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="mon-domain" className="block text-[13px] font-medium">
                Domain restriction <span className="font-normal text-[var(--text-muted)]">(optional)</span>
              </label>
              <input
                id="mon-domain"
                type="text"
                value={state.domain_restriction}
                onChange={(e) => set('domain_restriction', e.target.value)}
                placeholder="e.g. immobilienscout24.de"
                className="focus-ring h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm placeholder:text-[var(--text-subtle)]"
              />
            </div>
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="space-y-5" disabled={limitReached}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="mon-pmin" className="block text-[13px] font-medium">
                Price min (€)
              </label>
              <input
                id="mon-pmin"
                type="number"
                min={0}
                value={state.price_min}
                onChange={(e) => set('price_min', e.target.value)}
                placeholder="0"
                className={cn(
                  'focus-ring tnum h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm',
                  fieldErrors.price_min && 'border-[color:var(--color-negative)]'
                )}
              />
              {fieldErrors.price_min && <p className="text-xs text-[color:var(--color-negative)]">{fieldErrors.price_min}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="mon-pmax" className="block text-[13px] font-medium">
                Price max (€)
              </label>
              <input
                id="mon-pmax"
                type="number"
                min={0}
                value={state.price_max}
                onChange={(e) => set('price_max', e.target.value)}
                placeholder="350,000"
                className={cn(
                  'focus-ring tnum h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm',
                  fieldErrors.price_max && 'border-[color:var(--color-negative)]'
                )}
              />
              {fieldErrors.price_max && <p className="text-xs text-[color:var(--color-negative)]">{fieldErrors.price_max}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mon-keywords" className="block text-[13px] font-medium">
              Keyword tags <span className="font-normal text-[var(--text-muted)]">(comma separated)</span>
            </label>
            <input
              id="mon-keywords"
              type="text"
              value={state.keywords}
              onChange={(e) => set('keywords', e.target.value)}
              placeholder="apartment, wohnung, altbau"
              className="focus-ring h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm placeholder:text-[var(--text-subtle)]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mon-excluded" className="block text-[13px] font-medium">
              Excluded terms
            </label>
            <input
              id="mon-excluded"
              type="text"
              value={state.excluded_terms}
              onChange={(e) => set('excluded_terms', e.target.value)}
              placeholder="agents only, swap, wanted"
              className="focus-ring h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm placeholder:text-[var(--text-subtle)]"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-[13px] font-medium">Sensitivity</span>
            <div role="radiogroup" aria-label="Sensitivity" className="grid grid-cols-3 gap-2">
              {SENSITIVITIES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={state.sensitivity === s.value}
                  onClick={() => set('sensitivity', s.value)}
                  title={s.hint}
                  className={cn(
                    'focus-ring rounded-lg border p-3 text-left transition-colors',
                    state.sensitivity === s.value
                      ? 'border-[color:var(--color-brand)] bg-[color:var(--color-brand-subtle)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)]'
                  )}
                >
                  <span className="block text-[13px] font-medium">{s.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-[var(--text-muted)]">{s.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="space-y-4" disabled={limitReached}>
          <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
            <div>
              <p className="text-[13px] font-medium">In-app notifications</p>
              <p className="text-[11px] text-[var(--text-muted)]">Alerts inside ORBIT the moment a match appears</p>
            </div>
            <StretchSwitch checked={state.notify_in_app} onChange={(v) => set('notify_in_app', v)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--color-surface-subtle)] px-4 py-3 opacity-70">
            <div>
              <p className="text-[13px] font-medium">
                Email notifications{' '}
                <span className="ml-1 rounded-full border border-[var(--border)] px-1.5 py-0.5 text-[10px] uppercase text-[var(--text-muted)]">
                  Coming soon
                </span>
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Email requires account verification — going live at launch.
              </p>
            </div>
            <StretchSwitch checked={false} onChange={() => undefined} disabled aria-disabled />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
            <div>
              <p className="text-[13px] font-medium">Daily digest</p>
              <p className="text-[11px] text-[var(--text-muted)]">One summary instead of instant alerts</p>
            </div>
            <StretchSwitch checked={state.digest_mode} onChange={(v) => set('digest_mode', v)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
            <div>
              <p className="text-[13px] font-medium">Price drops only</p>
              <p className="text-[11px] text-[var(--text-muted)]">Only alert when a tracked item gets cheaper</p>
            </div>
            <StretchSwitch checked={state.price_drop_only} onChange={(v) => set('price_drop_only', v)} />
          </div>
        </fieldset>
      )}

      {step === 3 && (
        <div className="space-y-4" aria-live="polite">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--color-surface-subtle)] p-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">
              Criteria summary
            </p>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2">
              {[
                ['Name', state.name || state.description.slice(0, 60)],
                ['Category', CATEGORY_LABELS[state.category]],
                ['Sensitivity', SENSITIVITIES.find((s) => s.value === state.sensitivity)?.label ?? ''],
                ['Price range', `${state.price_min || 'any'} – ${state.price_max || 'any'}`],
                ['Keywords', state.keywords || '—'],
                ['Excluded', state.excluded_terms || '—'],
                ['Domain', state.domain_restriction || 'any'],
                ['Alerts', state.digest_mode ? 'Daily digest' : 'Instant in-app'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="w-24 shrink-0 text-[var(--text-muted)]">{k}</dt>
                  <dd className="min-w-0 truncate font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs leading-relaxed text-[var(--text-muted)]">
            Check frequency: every {FREQUENCIES.find((f) => f.value === state.frequency_minutes)?.label.toLowerCase()} —{' '}
            <strong className="font-medium text-[var(--text-secondary)]">simulated until crawling is connected</strong>.
            Your monitor is saved and ready for the production pipeline.
          </p>
          <div className="space-y-1.5">
            <label htmlFor="mon-name" className="block text-[13px] font-medium">
              Monitor name
            </label>
            <input
              id="mon-name"
              type="text"
              value={state.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder={state.description.slice(0, 60)}
              className="focus-ring h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm"
            />
            {fieldErrors.name && <p className="text-xs text-[color:var(--color-negative)]">{fieldErrors.name}</p>}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
        <Button variant="secondary" size="sm" onClick={() => (step === 0 ? onCancel?.() : setStep(step - 1))}>
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step < 3 ? (
          <Button size="sm" disabled={!stepValid(step)} onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button size="sm" isLoading={pending} disabled={limitReached || pending} onClick={submitForm} leftIcon={<Sparkles className="size-4" />}>
            {mode === 'edit' ? 'Save changes' : 'Activate Monitor'}
          </Button>
        )}
      </div>
    </div>
  );

  if (openInModal) {
    return (
      <Modal
        open
        onClose={() => onCancel?.()}
        title={mode === 'edit' ? 'Edit monitor' : 'New Monitor'}
        description={mode === 'edit' ? 'Update your watch criteria' : 'Describe what you want — ORBIT watches sources for you'}
        className="max-w-2xl"
      >
        {body}
      </Modal>
    );
  }
  return body;
}
