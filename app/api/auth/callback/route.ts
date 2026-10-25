import { NextResponse } from 'next/server';

/** Supabase OAuth callback placeholder: exchanges ?code for a session in the
 *  production setup. Local email/password auth doesn't route through here. */
export async function GET(request: Request) {
  const url = new URL('/app/overview', request.url);
  return NextResponse.redirect(url);
}
