/* Server-side session access (Server Components / Server Actions). */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionValue } from './session';
import { bootstrapUserFromSession, findUserById, getProfile } from '@/lib/data/misc';
import type { Profile } from '@/lib/types';

export interface SessionUser {
  id: string;
  email: string;
  profile: Profile;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  const payload = await verifySessionValue(raw);
  if (!payload) return null;
  let user = findUserById(payload.uid);
  // Serverless demo mode: the session is HMAC-signed, so a valid cookie is
  // proof of authentication. If this instance's ephemeral database has never
  // seen the user (cold instance after signup elsewhere), re-provision the
  // account and its demo content here.
  if (!user && payload.email) {
    user = bootstrapUserFromSession(payload.uid, payload.email, payload.name);
  }
  if (!user) return null;
  const profile = getProfile(user.id);
  if (!profile) return null;
  return { id: user.id, email: user.email, profile };
}

export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const store = await cookies();
  const hasCookie = Boolean(store.get(SESSION_COOKIE)?.value);
  const user = await getSessionUser();
  if (!user) {
    // A cookie that fails to resolve to a user is stale (e.g. the local DB was
    // reset). Route through /api/auth/expire to clear it, avoiding a redirect
    // loop with middleware's authenticated-user bounce.
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : '';
    redirect(hasCookie ? `/api/auth/expire${next}` : `/login${next}`);
  }
  return user;
}
