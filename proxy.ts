import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, getCookieSecret } from '@/lib/auth';

const ADMIN_COOKIE = ADMIN_COOKIE_NAME;

// The admin panel lives under [locale] in the App Router. Public URLs do not
// carry the locale prefix (localePrefix: 'never'), so the proxy rewrites
// everything to /en/* internally and redirects /admin/* through the locale
// segment so the App Router can match `app/[locale]/admin/**`.
const ADMIN_PATH_REGEX = /^(?:\/(?:en))?\/admin(?:\/|$)/;
const ADMIN_LOGIN_REGEX = /^(?:\/(?:en))?\/admin\/login\/?$/;

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets must bypass locale rewriting even when the matcher runs.
  if (pathname.includes('.')) return NextResponse.next();

  const isAdminPath = ADMIN_PATH_REGEX.test(pathname);
  const isLoginPath = ADMIN_LOGIN_REGEX.test(pathname);
  const hasLocalePrefix = pathname === '/en' || pathname.startsWith('/en/');
  const adminPath = pathname.replace(/^\/en/, '') || '/';

  if (pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.redirect(url);
  }

  if (isAdminPath) {
    const session = request.cookies.get(ADMIN_COOKIE)?.value;
    const expected = getCookieSecret();
    const isAuthed = Boolean(expected && session === expected);

    if (!isAuthed && !isLoginPath) {
      return NextResponse.redirect(new URL('/en/admin/login', request.url));
    }
    if (isAuthed && isLoginPath) {
      return NextResponse.redirect(new URL('/en/admin/dashboard', request.url));
    }

    const response = NextResponse.next();
    response.headers.set('x-pathname', adminPath);
    return response;
  }

  if (!hasLocalePrefix) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
