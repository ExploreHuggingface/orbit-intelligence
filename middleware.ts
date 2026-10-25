import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionValue } from '@/lib/auth/session';
import { LOCALE_COOKIE, isLocale, localeForCountry } from '@/lib/i18n/config';

const APP_PREFIX = '/app';
const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySessionValue(request.cookies.get(SESSION_COOKIE)?.value);

  // First visit without a locale cookie: derive it from the visitor's country
  // (Vercel GeoIP) so the UI renders in the right language automatically.
  const hasLocaleCookie = isLocale(request.cookies.get(LOCALE_COOKIE)?.value);
  if (!hasLocaleCookie) {
    const country =
      request.headers.get('x-vercel-ip-country') ??
      request.headers.get('cf-ipcountry') ??
      null;
    const locale = localeForCountry(country);
    // Set on the response of matched routes; page requests that bypass the
    // matcher still get the cookie from the server-side header fallback.
    request.cookies.set(LOCALE_COOKIE, locale);
  }

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

  const response = NextResponse.next({ request });
  if (!hasLocaleCookie) {
    response.cookies.set(LOCALE_COOKIE, request.cookies.get(LOCALE_COOKIE)?.value ?? 'en', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }
  return response;
}

export const config = {
  matcher: ['/app/:path*', '/login', '/signup', '/forgot-password', '/reset-password'],
};
