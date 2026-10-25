'use server';

/* Auth server actions: local email/password auth over SQLite with signed,
   HTTP-only session cookies. */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionValue } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { createUser, findUserByEmail } from '@/lib/data/misc';
import { logActivity } from '@/lib/data/activity';
import { signInSchema, signUpSchema } from '@/lib/validations/auth';

export interface ActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
  checkInbox?: boolean;
}

function fail(error: string, fieldErrors?: Record<string, string>): ActionState {
  return { error, fieldErrors, ok: false };
}

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    password: formData.get('password'),
    accept_terms: formData.get('accept_terms') === 'on' ? true : undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return fail('Please fix the highlighted fields.', fieldErrors);
  }

  const { email, password, full_name } = parsed.data;
  if (findUserByEmail(email)) {
    return fail('An account with this email already exists. Try signing in instead.', {
      email: 'Email already registered',
    });
  }

  const user = createUser({ email, password, full_name }, 'pro');
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionValue(user.id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  logActivity(user.id, 'profile_updated', { section: 'account_created' });
  redirect('/app/onboarding');
}

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return fail('Please fix the highlighted fields.', fieldErrors);
  }

  const { email, password } = parsed.data;
  const user = findUserByEmail(email);
  // Uniform error message — never reveal which field failed (plan §22).
  if (!user || !verifyPassword(password, user.password_hash)) {
    return fail('Invalid email or password. Please try again.');
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionValue(user.id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  const next = String(formData.get('next') ?? '');
  redirect(next && next.startsWith('/app') ? next : '/app/overview');
}

export async function signOutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/');
}

export async function forgotPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim();
  if (!/.+@.+\..+/.test(email)) {
    return fail('Enter a valid email address.', { email: 'Enter a valid email address' });
  }
  // Honest state: no email delivery exists in the local build (plan §4).
  return { ok: true };
}
