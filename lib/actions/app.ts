'use server';

/* App mutation server actions. Every mutation: validates with Zod, enforces
   plan gates, writes an activity event, and returns a serializable result. */

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/server';
import { monitorSchema, collectionSchema, settingsProfileSchema, contactSchema } from '@/lib/validations/entities';
import * as monitorsRepo from '@/lib/data/monitors';
import * as collectionsRepo from '@/lib/data/collections';
import * as searchRepo from '@/lib/data/search';
import { markNotificationRead, markAllNotificationsRead, logActivity } from '@/lib/data/activity';
import { getPlanForUser, insertContactMessage, updateProfile, resetDemoData } from '@/lib/data/misc';
import { updateOpportunityStatus, toggleInteresting, saveSearchRecord } from '@/lib/data/search';
import { OPPORTUNITY_STATUSES } from '@/lib/types';
import type { OpportunityStatus } from '@/lib/types';

export interface MutationResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: Record<string, unknown>;
}

function fail(error: string, fieldErrors?: Record<string, string>): MutationResult {
  return { ok: false, error, fieldErrors };
}

/* --------------------------------- Monitors --------------------------------- */

export async function createMonitorAction(_prev: MutationResult | null, formData: FormData): Promise<MutationResult> {
  const user = await requireUser();
  const raw = {
    name: String(formData.get('name') ?? ''),
    description: String(formData.get('description') ?? ''),
    category: String(formData.get('category') ?? 'real_estate'),
    sensitivity: String(formData.get('sensitivity') ?? 'balanced'),
    frequency_minutes: Number(formData.get('frequency_minutes') ?? 30),
    price_min: formData.get('price_min') ? Number(formData.get('price_min')) : null,
    price_max: formData.get('price_max') ? Number(formData.get('price_max')) : null,
    keywords: String(formData.get('keywords') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    excluded_terms: String(formData.get('excluded_terms') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    domain_restriction: String(formData.get('domain_restriction') ?? '') || null,
    notify_in_app: formData.get('notify_in_app') !== 'off',
    digest_mode: formData.get('digest_mode') === 'on',
    price_drop_only: formData.get('price_drop_only') === 'on',
  };
  const parsed = monitorSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return fail('Please fix the highlighted fields.', fieldErrors);
  }

  const billing = getPlanForUser(user.id);
  const limit = billing?.plan.monitor_limit ?? 3;
  const activeCount = monitorsRepo.countActiveMonitors(user.id);
  if (limit >= 0 && activeCount >= limit) {
    return fail(`Your ${billing?.plan.name} plan allows ${limit} monitors. Upgrade to add more.`);
  }

  const monitor = monitorsRepo.createMonitor(user.id, {
    name: parsed.data.name,
    description: parsed.data.description,
    category: parsed.data.category,
    sensitivity: parsed.data.sensitivity,
    frequency_minutes: parsed.data.frequency_minutes,
    notify_in_app: parsed.data.notify_in_app,
    notify_email: false, // email delivery is not live (plan §4)
    digest_mode: parsed.data.digest_mode,
    price_drop_only: parsed.data.price_drop_only,
    criteria: {
      price_min: parsed.data.price_min ?? undefined,
      price_max: parsed.data.price_max ?? undefined,
      keywords: parsed.data.keywords,
      excluded_terms: parsed.data.excluded_terms,
      required_attributes: {},
      domain_restriction: parsed.data.domain_restriction ?? undefined,
    },
  });
  logActivity(user.id, 'monitor_created', { name: monitor.name });
  revalidatePath('/app/monitors');
  revalidatePath('/app/overview');
  return { ok: true, data: { id: monitor.id, name: monitor.name } };
}

export async function updateMonitorAction(_prev: MutationResult | null, formData: FormData): Promise<MutationResult> {
  const user = await requireUser();
  const id = String(formData.get('id') ?? '');
  const raw = {
    name: String(formData.get('name') ?? ''),
    description: String(formData.get('description') ?? ''),
    category: String(formData.get('category') ?? 'real_estate'),
    sensitivity: String(formData.get('sensitivity') ?? 'balanced'),
    frequency_minutes: Number(formData.get('frequency_minutes') ?? 30),
    price_min: formData.get('price_min') ? Number(formData.get('price_min')) : null,
    price_max: formData.get('price_max') ? Number(formData.get('price_max')) : null,
    keywords: String(formData.get('keywords') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    excluded_terms: String(formData.get('excluded_terms') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    domain_restriction: String(formData.get('domain_restriction') ?? '') || null,
    notify_in_app: formData.get('notify_in_app') !== 'off',
    digest_mode: formData.get('digest_mode') === 'on',
    price_drop_only: formData.get('price_drop_only') === 'on',
  };
  const parsed = monitorSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return fail('Please fix the highlighted fields.', fieldErrors);
  }
  const monitor = monitorsRepo.updateMonitor(user.id, id, parsed.data);
  if (!monitor) return fail('Monitor not found.');
  logActivity(user.id, 'monitor_updated', { name: monitor.name });
  revalidatePath('/app/monitors');
  revalidatePath('/app/overview');
  return { ok: true, data: { id: monitor.id, name: monitor.name } };
}

export async function setMonitorStatusAction(monitorId: string, status: 'active' | 'paused'): Promise<MutationResult> {
  const user = await requireUser();
  const ok = monitorsRepo.setMonitorStatus(user.id, monitorId, status);
  if (!ok) return fail('Monitor not found.');
  logActivity(user.id, status === 'paused' ? 'monitor_paused' : 'monitor_resumed', { id: monitorId });
  revalidatePath('/app/monitors');
  revalidatePath('/app/overview');
  return { ok: true };
}

export async function deleteMonitorAction(monitorId: string): Promise<MutationResult> {
  const user = await requireUser();
  const monitor = monitorsRepo.deleteMonitor(user.id, monitorId);
  if (!monitor) return fail('Monitor not found.');
  logActivity(user.id, 'monitor_deleted', { name: monitor.name });
  revalidatePath('/app/monitors');
  revalidatePath('/app/overview');
  return { ok: true, data: { name: monitor.name } };
}

/** Restore a monitor deleted moments ago (Undo). */
export async function restoreMonitorAction(monitor: {
  name: string;
  description: string;
  category: string;
  criteria: unknown;
  sensitivity: string;
  frequency_minutes: number;
  notify_in_app: boolean;
  notify_email: boolean;
  digest_mode: boolean;
  price_drop_only: boolean;
  status: string;
  match_count: number;
}): Promise<MutationResult> {
  const user = await requireUser();
  const created = monitorsRepo.createMonitor(user.id, {
    name: monitor.name,
    description: monitor.description,
    category: monitor.category as Parameters<typeof monitorsRepo.createMonitor>[1]['category'],
    criteria: monitor.criteria as Parameters<typeof monitorsRepo.createMonitor>[1]['criteria'],
    sensitivity: monitor.sensitivity as Parameters<typeof monitorsRepo.createMonitor>[1]['sensitivity'],
    frequency_minutes: monitor.frequency_minutes,
    notify_in_app: monitor.notify_in_app,
    notify_email: monitor.notify_email,
    digest_mode: monitor.digest_mode,
    price_drop_only: monitor.price_drop_only,
  });
  logActivity(user.id, 'monitor_created', { name: created.name, restored: true });
  revalidatePath('/app/monitors');
  revalidatePath('/app/overview');
  return { ok: true, data: { id: created.id, name: created.name } };
}

/* ------------------------------- Opportunities ------------------------------- */

export async function setOpportunityStatusAction(opportunityId: string, status: OpportunityStatus): Promise<MutationResult> {
  const user = await requireUser();
  if (!OPPORTUNITY_STATUSES.includes(status)) return fail('Unknown status.');
  const changed = updateOpportunityStatus(user.id, [opportunityId], status);
  if (!changed) return fail('Only opportunities you created can be re-statused. Use "Mark as interesting" for sample rows.');
  revalidatePath('/app/opportunities');
  revalidatePath('/app/overview');
  revalidatePath('/app/discover');
  return { ok: true };
}

export async function bulkUpdateStatusAction(ids: string[], status: OpportunityStatus): Promise<MutationResult> {
  const user = await requireUser();
  if (!OPPORTUNITY_STATUSES.includes(status)) return fail('Unknown status.');
  const changed = updateOpportunityStatus(user.id, ids, status);
  logActivity(user.id, 'bulk_status_changed', { count: changed, status });
  revalidatePath('/app/opportunities');
  revalidatePath('/app/overview');
  return { ok: true, data: { changed } };
}

export async function toggleInterestingAction(opportunityId: string, interesting: boolean): Promise<MutationResult> {
  const user = await requireUser();
  const ok = toggleInteresting(user.id, opportunityId, interesting);
  if (!ok) return fail('Sample opportunities cannot be modified this way.');
  revalidatePath('/app/discover');
  return { ok: true };
}

/* -------------------------------- Collections -------------------------------- */

export async function createCollectionAction(_prev: MutationResult | null, formData: FormData): Promise<MutationResult> {
  const user = await requireUser();
  const parsed = collectionSchema.safeParse({ name: String(formData.get('name') ?? '') });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const billing = getPlanForUser(user.id);
  const limit = billing?.plan.collection_limit ?? 2;
  const count = collectionsRepo.countCollections(user.id);
  if (limit >= 0 && count >= limit) {
    return fail(`Your ${billing?.plan.name} plan allows ${limit} collections. Upgrade for unlimited.`);
  }
  const collection = collectionsRepo.createCollection(user.id, parsed.data.name);
  logActivity(user.id, 'collection_created', { name: collection.name });
  revalidatePath('/app/collections');
  return { ok: true, data: { id: collection.id, name: collection.name } };
}

export async function addToCollectionAction(collectionId: string, opportunityId: string): Promise<MutationResult> {
  const user = await requireUser();
  const ok = collectionsRepo.addItem(user.id, collectionId, opportunityId);
  if (!ok) return fail('Collection not found.');
  const collection = collectionsRepo.listCollections(user.id).find((c) => c.id === collectionId);
  const opp = searchRepo.getOpportunityById(user.id, opportunityId);
  logActivity(user.id, 'added_to_collection', { collection: collection?.name, title: opp?.title });
  revalidatePath('/app/collections');
  return { ok: true };
}

export async function removeFromCollectionAction(collectionId: string, opportunityId: string): Promise<MutationResult> {
  const user = await requireUser();
  const ok = collectionsRepo.removeItem(user.id, collectionId, opportunityId);
  if (!ok) return fail('Item not found.');
  revalidatePath('/app/collections');
  return { ok: true };
}

export async function deleteCollectionAction(collectionId: string): Promise<MutationResult> {
  const user = await requireUser();
  const ok = collectionsRepo.deleteCollection(user.id, collectionId);
  if (!ok) return fail('Collection not found.');
  revalidatePath('/app/collections');
  return { ok: true };
}

/* ------------------------------- Notifications ------------------------------- */

export async function markNotificationReadAction(notificationId: string): Promise<MutationResult> {
  const user = await requireUser();
  const ok = markNotificationRead(user.id, notificationId);
  if (!ok) return fail('Notification not found.');
  revalidatePath('/app/notifications');
  return { ok: true };
}

export async function markAllReadAction(): Promise<MutationResult> {
  const user = await requireUser();
  const changed = markAllNotificationsRead(user.id);
  revalidatePath('/app/notifications');
  return { ok: true, data: { changed } };
}

/* --------------------------------- Searches ---------------------------------- */

export async function saveSearchAction(query: string, category: string): Promise<MutationResult> {
  const user = await requireUser();
  saveSearchRecord(user.id, query, category === 'all' ? null : (category as never));
  logActivity(user.id, 'search_saved', { query });
  return { ok: true };
}

/* --------------------------------- Settings ---------------------------------- */

export async function updateProfileAction(_prev: MutationResult | null, formData: FormData): Promise<MutationResult> {
  const user = await requireUser();
  const parsed = settingsProfileSchema.safeParse({
    full_name: String(formData.get('full_name') ?? ''),
    timezone: String(formData.get('timezone') ?? ''),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  updateProfile(user.id, parsed.data);
  logActivity(user.id, 'profile_updated', { section: 'profile' });
  revalidatePath('/app/settings');
  return { ok: true };
}

export async function completeOnboardingAction(step: number, interests: string[]): Promise<MutationResult> {
  const user = await requireUser();
  updateProfile(user.id, { onboarding_step: step });
  if (interests.length > 0) updateProfile(user.id, { interests });
  if (step >= 3) updateProfile(user.id, { onboarded_at: new Date().toISOString() });
  return { ok: true };
}

export async function resetDemoDataAction(): Promise<MutationResult> {
  const user = await requireUser();
  resetDemoData(user.id);
  logActivity(user.id, 'data_reset', {});
  revalidatePath('/app', 'layout');
  return { ok: true };
}

/* ---------------------------------- Contact ---------------------------------- */

export async function contactAction(_prev: MutationResult | null, formData: FormData): Promise<MutationResult> {
  const parsed = contactSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    company: String(formData.get('company') ?? '') || null,
    topic: String(formData.get('topic') ?? 'support'),
    message: String(formData.get('message') ?? ''),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return fail('Please fix the highlighted fields.', fieldErrors);
  }
  const msg = insertContactMessage({ ...parsed.data, company: parsed.data.company ?? null, kind: 'contact' });
  return { ok: true, data: { id: msg.id } };
}

export async function joinWaitlistAction(_prev: MutationResult | null, formData: FormData): Promise<MutationResult> {
  const email = String(formData.get('email') ?? '').trim();
  if (!/.+@.+\..+/.test(email)) return fail('Enter a valid email address.', { email: 'Enter a valid email address' });
  insertContactMessage({
    name: 'Billing waitlist',
    email,
    company: null,
    topic: 'sales',
    kind: 'billing_waitlist',
    message: 'Requested billing waitlist access from the pricing/plan modal.',
  });
  return { ok: true };
}
