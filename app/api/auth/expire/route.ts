import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/session';

/** Clears a stale session cookie (e.g. user removed from the local DB) and
 *  returns to the login page. Breaks the login ⇄ app redirect loop. */
export async function GET(request: Request) {
  const url = new URL('/login', request.url);
  const next = new URL(request.url).searchParams.get('next');
  if (next?.startsWith('/app')) url.searchParams.set('next', next);
  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
