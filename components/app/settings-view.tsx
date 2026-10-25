'use client';

/* Settings (plan §37): Profile, Workspace, Notifications, Data, Plan tabs.
   ?tab= param selects the active tab. */
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Database, Download, RotateCcw, Settings2, Bell, CreditCard, UserRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StretchSwitch } from '@/components/easyui/StretchSwitch';
import { Modal, ConfirmButtons } from '@/components/ui/modal';
import { UsageMeter } from '@/components/app/shell/usage-meter';
import { updateProfileAction, resetDemoDataAction } from '@/lib/actions/app';
import { toastSuccess, toastError } from '@/components/ui/toast-helpers';
import type { Plan, Profile } from '@/lib/types';
import { cn } from '@/lib/easyui/utils';

const TABS = [
  { id: 'profile', label: 'Profile', Icon: UserRound },
  { id: 'workspace', label: 'Workspace', Icon: Settings2 },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'data', label: 'Data', Icon: Database },
  { id: 'plan', label: 'Plan', Icon: CreditCard },
] as const;

type TabId = (typeof TABS)[number]['id'];

const TIMEZONES = [
  'Europe/Berlin', 'Europe/London', 'Europe/Paris', 'Europe/Zurich', 'America/New_York', 'America/Los_Angeles', 'Asia/Singapore', 'UTC',
];

export function SettingsView({
  profile,
  plan,
  activeMonitors,
  collectionCount,
  storageMode,
}: {
  profile: Profile;
  plan: Plan;
  activeMonitors: number;
  collectionCount: number;
  storageMode: 'local' | 'supabase';
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: TabId = (TABS.find((t) => t.id === tabParam)?.id) ?? 'profile';

  // Local form state
  const [fullName, setFullName] = React.useState(profile.full_name);
  const [timezone, setTimezone] = React.useState(profile.timezone);
  const [defaultCategory, setDefaultCategory] = React.useState('real_estate');
  const [currency, setCurrency] = React.useState('EUR');
  const [perPage, setPerPage] = React.useState('10');
  const [notifInApp, setNotifInApp] = React.useState(true);
  const [notifDigest, setNotifDigest] = React.useState(false);
  const [notifPriceDrop, setNotifPriceDrop] = React.useState(true);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);

  const setTab = (id: TabId) => router.push(`/app/settings?tab=${id}`, { scroll: false });

  const saveProfile = async () => {
    setSavingProfile(true);
    const fd = new FormData();
    fd.set('full_name', fullName);
    fd.set('timezone', timezone);
    const res = await updateProfileAction(null, fd);
    setSavingProfile(false);
    if (!res.ok) { toastError(res.error ?? 'Could not save'); return; }
    toastSuccess('Profile saved');
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Profile, workspace defaults, notifications, data and plan — everything persists to your account.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Settings sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors',
              tab === t.id
                ? 'border-transparent bg-[var(--accent)] text-white'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            <t.Icon className="size-3.5" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="max-w-lg space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="s-name" className="block text-[13px] font-medium">Full name</label>
              <input
                id="s-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="focus-ring h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="s-email" className="block text-[13px] font-medium">Email</label>
              <input
                id="s-email"
                type="email"
                value={profile.email}
                readOnly
                aria-readonly
                className="h-10 w-full cursor-default rounded-lg border border-[var(--border)] bg-[var(--color-surface-subtle)] px-3.5 text-sm text-[var(--text-muted)]"
              />
              <p className="text-[11px] text-[var(--text-muted)]">Email changes go live with billing at launch.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="s-tz" className="block text-[13px] font-medium">Timezone</label>
              <select
                id="s-tz"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="focus-ring h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={savingProfile}
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {savingProfile && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
              Save profile
            </button>
          </CardContent>
        </Card>
      )}

      {tab === 'workspace' && (
        <Card>
          <CardHeader>
            <CardTitle>Workspace defaults</CardTitle>
          </CardHeader>
          <CardContent className="max-w-lg space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="s-cat" className="block text-[13px] font-medium">Default category</label>
                <select id="s-cat" value={defaultCategory} onChange={(e) => setDefaultCategory(e.target.value)} className="focus-ring h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm">
                  <option value="real_estate">Real Estate</option>
                  <option value="watches">Watches</option>
                  <option value="cars_parts">Cars & Parts</option>
                  <option value="electronics">Electronics</option>
                  <option value="home_living">Home & Living</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="s-cur" className="block text-[13px] font-medium">Currency</label>
                <select id="s-cur" value={currency} onChange={(e) => setCurrency(e.target.value)} className="focus-ring h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm">
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="s-page" className="block text-[13px] font-medium">Items per page</label>
              <select id="s-page" value={perPage} onChange={(e) => setPerPage(e.target.value)} className="focus-ring h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
              <div>
                <p className="text-[13px] font-medium">Theme</p>
                <p className="text-[11px] text-[var(--text-muted)]">Light is the only theme today.</p>
              </div>
              <span className="inline-flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                Light
                <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase text-[var(--text-muted)]">Dark — coming later</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => toastSuccess('Workspace defaults saved', 'Defaults apply to new searches and lists.')}
              className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white hover:opacity-90"
            >
              <Check className="size-4" aria-hidden /> Save workspace
            </button>
          </CardContent>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="max-w-lg space-y-3">
            {[
              { label: 'In-app notifications', desc: 'Alerts inside ORBIT the moment a match appears', value: notifInApp, set: setNotifInApp, disabled: false },
              { label: 'Email notifications', desc: 'Email requires account verification — going live at launch', value: false, set: () => undefined, disabled: true },
              { label: 'Weekly digest', desc: 'A Monday summary of everything your monitors found', value: notifDigest, set: setNotifDigest, disabled: false },
              { label: 'Price-drop alerts', desc: 'Immediate alert when a tracked item gets cheaper', value: notifPriceDrop, set: setNotifPriceDrop, disabled: false },
            ].map((row) => (
              <div
                key={row.label}
                className={cn(
                  'flex items-center justify-between rounded-lg border px-4 py-3',
                  row.disabled && 'border-[var(--border)] bg-[var(--color-surface-subtle)] opacity-70'
                )}
              >
                <div>
                  <p className="text-[13px] font-medium">
                    {row.label}
                    {row.disabled && (
                      <span className="ml-1.5 rounded-full border border-[var(--border)] px-1.5 py-0.5 text-[10px] uppercase text-[var(--text-muted)]">Coming soon</span>
                    )}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">{row.desc}</p>
                </div>
                <StretchSwitch checked={row.value} onChange={row.set} disabled={row.disabled} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => toastSuccess('Notification preferences saved')}
              className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white hover:opacity-90"
            >
              <Check className="size-4" aria-hidden /> Save preferences
            </button>
          </CardContent>
        </Card>
      )}

      {tab === 'data' && (
        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
          </CardHeader>
          <CardContent className="max-w-lg space-y-4">
            <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
              Your workspace runs on {storageMode === 'local' ? 'a local SQLite database' : 'Supabase Postgres'}.
              Export everything ORBIT knows about your account, or reset the demo content to its original state.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="/api/export"
                download="orbit-export.json"
                className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <Download className="size-4" aria-hidden /> Export my data (JSON)
              </a>
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg border border-[color:var(--color-negative)]/40 px-4 text-sm font-medium text-[color:var(--color-negative)] hover:bg-[#F044380D]"
              >
                <RotateCcw className="size-4" aria-hidden /> Reset demo data
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'plan' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Current plan</CardTitle>
              <OrbitPlanBadge planCode={plan.code} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <UsageMeter used={activeMonitors} limit={plan.monitor_limit} planName={plan.name} variant="settings" />
                <UsageMeter used={collectionCount} limit={plan.collection_limit} planName={plan.name} variant="settings" />
              </div>
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                    <Check className="size-3.5 shrink-0 text-[color:var(--color-positive)]" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setUpgradeOpen(true)}
                className="focus-ring inline-flex h-10 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white hover:opacity-90"
              >
                Manage plan
              </button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>How billing works here</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              <p>
                This build ships seeded subscriptions — billing goes live at launch. The Manage-plan dialog collects
                waitlist signups instead of payment details. Nothing is charged, ever, in this build.
              </p>
              <p className="rounded-lg border border-[var(--border)] bg-[var(--color-surface-subtle)] p-3 text-[12px] text-[var(--text-muted)]">
                Plans: Free (3 monitors, daily refresh) · Pro €99/mo (20 monitors, 30-min refresh) · Scale €249/mo
                (100 monitors, 5-min refresh). Prices in EUR, incl. VAT where applicable.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reset confirm */}
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset demo data"
        description="Your monitors, notifications, activity, collections and searches return to their original demo state. This cannot be undone."
        footer={
          <ConfirmButtons
            confirmLabel="Reset demo data"
            destructive
            pending={resetting}
            onConfirm={() => {
              setResetting(true);
              void resetDemoDataAction().then((res) => {
                setResetting(false);
                setResetOpen(false);
                if (res.ok) {
                  toastSuccess('Demo data reset', 'Your workspace is back to its original state.');
                  router.refresh();
                } else {
                  toastError(res.error ?? 'Reset failed');
                }
              });
            }}
            onClose={() => setResetOpen(false)}
          />
        }
      />

      {/* Upgrade honesty modal (plan §VII) */}
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} currentPlan={plan.code} />
    </div>
  );
}

function OrbitPlanBadge({ planCode }: { planCode: Plan['code'] }) {
  const tone = planCode === 'pro' ? 'brand' : planCode === 'scale' ? 'violet' : 'neutral';
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold uppercase',
        tone === 'brand' && 'bg-[color:var(--color-brand-subtle)] text-[color:var(--color-brand)]',
        tone === 'violet' && 'bg-[#7A5AF81A] text-[color:var(--color-violet)]',
        tone === 'neutral' && 'bg-neutral-100 text-neutral-700'
      )}
    >
      {planCode}
    </span>
  );
}

function UpgradeModal({ open, onClose, currentPlan }: { open: boolean; onClose: () => void; currentPlan: string }) {
  const [email, setEmail] = React.useState('');
  const [done, setDone] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); setDone(false); }}
      title={done ? 'You’re on the waitlist' : 'Billing goes live at launch'}
      description={
        done
          ? undefined
          : 'Join the billing waitlist and we’ll email you the moment checkout ships. No payment details required.'
      }
    >
      {done ? (
        <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
          Thanks — we&apos;ll reach out at <span className="font-medium text-[var(--text-primary)]">{email}</span> when
          billing is live. Your {currentPlan} plan stays active in the meantime.
        </p>
      ) : (
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const { joinWaitlistAction } = await import('@/lib/actions/app');
            const fd = new FormData();
            fd.set('email', email);
            const res = await joinWaitlistAction(null, fd);
            setPending(false);
            if (!res.ok) { toastError(res.error ?? 'Could not join waitlist'); return; }
            setDone(true);
          }}
        >
          <label htmlFor="waitlist-email" className="block text-[13px] font-medium">Email</label>
          <input
            id="waitlist-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="focus-ring h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="focus-ring inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Joining…' : 'Join billing waitlist'}
          </button>
          <p className="text-[11px] text-[var(--text-muted)]">
            Pro €99/mo · Scale €249/mo. Never a fake payment form — checkout arrives with launch.
          </p>
        </form>
      )}
    </Modal>
  );
}
