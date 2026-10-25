import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionValue } from '@/lib/auth/session';

const APP_PREFIX = '/app';
const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySessionValue(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith(APP_PREFIX) && !pathname.startsWith('/app/invite')) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
    // New users land on onboarding until they finish it.
    if (pathname === '/app' || pathname === '/app/') {
      const url = request.nextUrl.clone();
      url.pathname = '/app/overview';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  if (AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p + '/')) && session) {
    const url = request.nextUrl.clone();
    url.pathname = '/app/overview';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/login', '/signup', '/forgot-password', '/reset-password'],
};
