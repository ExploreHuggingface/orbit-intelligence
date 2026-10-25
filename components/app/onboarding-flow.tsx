'use client';

/* Onboarding (plan §23): interests → first monitor → done. Steps persist via
   profiles.onboarding_step; the wizard reuses the monitor form component. */
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Check, Home, Laptop, Sparkles, Watch } from 'lucide-react';
import { Stepper } from '@/components/easyui/stepper';
import { Button } from '@/components/easyui/Button';
import { MonitorForm } from '@/components/app/monitors/monitor-form';
import { completeOnboardingAction } from '@/lib/actions/app';
import { CATEGORIES, CATEGORY_LABELS, type Category } from '@/lib/types';
import { cn } from '@/lib/easyui/utils';

const INTEREST_ICONS: Record<Category, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  real_estate: Building2,
  watches: Watch,
  cars_parts: Home,
  electronics: Laptop,
  home_living: Sparkles,
};

const PREFILL: Record<Category, string> = {
  real_estate: 'Apartments in Berlin-Friedrichshain under €350k with estimated gross yield above 5.5%',
  watches: 'Omega Seamaster Diver 300M in excellent condition with box and papers, below €4,000',
  cars_parts: 'Genuine OEM parts for the Porsche 911 (997) — headlights, trim, rare options',
  electronics: 'Business lease returns: ThinkPad X1 Carbon, Grade A, i7/16GB, under €700',
  home_living: 'Original mid-century lounge chairs and ottomans — Eames, Wegner, Vitra manufacturing',
};

export function OnboardingFlow({
  initialStep,
  initialInterests,
  completed,
}: {
  initialStep: number;
  initialInterests: string[];
  completed: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = React.useState(Math.min(initialStep, completed ? 2 : initialStep));
  const [interests, setInterests] = React.useState<Category[]>(
    initialInterests.filter((i): i is Category => (CATEGORIES as readonly string[]).includes(i))
  );
  const [monitorCreated, setMonitorCreated] = React.useState(false);
  const [primary, setPrimary] = React.useState<Category>('real_estate');

  const steps = [
    { title: 'Your interests', description: 'What are you hunting for?' },
    { title: 'First monitor', description: 'Set ORBIT watching for you' },
    { title: 'Done', description: 'Your workspace is ready' },
  ];

  const toggleInterest = (c: Category) => {
    setInterests((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
    setPrimary(c);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          Welcome to ORBIT
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Two quick steps and your workspace is watching sources for you.
        </p>
      </div>

      <Stepper steps={steps} current={step} onStepChange={(i) => i < step && setStep(i)} />

      {step === 0 && (
        <section aria-labelledby="step-interests" className="space-y-4">
          <h2 id="step-interests" className="text-lg font-semibold">
            What are you looking for?
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Pick one or more categories — we&apos;ll prefill your first monitor accordingly.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CATEGORIES.map((c) => {
              const Icon = INTEREST_ICONS[c];
              const active = interests.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleInterest(c)}
                  aria-pressed={active}
                  className={cn(
                    'focus-ring flex items-center gap-3 rounded-xl border p-4 text-left transition-colors',
                    active
                      ? 'border-[color:var(--color-brand)] bg-[color:var(--color-brand-subtle)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)]'
                  )}
                >
                  <span
                    className={cn(
                      'grid size-9 place-items-center rounded-lg',
                      active ? 'bg-[color:var(--color-brand)]/15 text-[color:var(--color-brand)]' : 'bg-[var(--color-surface-subtle)] text-[var(--text-secondary)]'
                    )}
                  >
                    <Icon className="size-4.5" strokeWidth={1.75} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                    {CATEGORY_LABELS[c]}
                  </span>
                  {active && <Check className="size-4 text-[color:var(--color-brand)]" aria-hidden />}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button
              size="md"
              disabled={interests.length === 0}
              onClick={() => {
                void completeOnboardingAction(1, interests);
                setStep(1);
              }}
            >
              Continue
            </Button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section aria-labelledby="step-monitor" className="space-y-4">
          <h2 id="step-monitor" className="text-lg font-semibold">
            Create your first monitor
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Prefilled for {CATEGORY_LABELS[primary]} — edit anything before saving.
          </p>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <MonitorForm
              defaultCategory={primary}
              defaultDescription={PREFILL[primary]}
              compact
              openInModal={false}
              onCreated={() => {
                setMonitorCreated(true);
                void completeOnboardingAction(2, interests);
                setStep(2);
              }}
            />
          </div>
          <div className="flex justify-between">
            <Button variant="secondary" size="md" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                void completeOnboardingAction(2, interests);
                setStep(2);
              }}
            >
              Skip for now
            </Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section aria-labelledby="step-done" className="space-y-5 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#12B76A1A] text-[color:var(--color-positive)]">
            <Check className="size-6" strokeWidth={2} aria-hidden />
          </span>
          <h2 id="step-done" className="text-lg font-semibold">
            {monitorCreated ? 'Your first monitor is live' : 'Your workspace is ready'}
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
            {monitorCreated
              ? 'ORBIT will check your sources and notify you about matching opportunities. Background crawling activates when the production backend is connected — until then, your workspace runs on sample data.'
              : 'You can create monitors any time from the Monitors page. Your workspace starts with sample data so every page has content.'}
          </p>
          <Button
            size="lg"
            onClick={() => {
              void completeOnboardingAction(3, interests);
              router.push('/app/overview');
            }}
          >
            Go to dashboard
          </Button>
        </section>
      )}
    </div>
  );
}
