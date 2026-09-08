import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './lib/routing';

const intlMiddleware = createIntlMiddleware(routing);

const ADMIN_COOKIE = 'rani_admin_session';

// trigger redeploy 2026-09-08 23:02:37Z
const ADMIN_PATH_REGEX = /^\/(?:en|id)?(?:\/)?admin(?:\/|$)/;
const ADMIN_LOGIN_REGEX = /^\/(?:en|id)?(?:\/)?admin\/login\/?$/;

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath = ADMIN_PATH_REGEX.test(pathname);
  const isLoginPath = ADMIN_LOGIN_REGEX.test(pathname);

  if (isAdminPath) {
    const session = request.cookies.get(ADMIN_COOKIE)?.value;
    const expected = process.env.COOKIE_SECRET || 'dev-cookie-secret-change-in-production';
    const isAuthed = session === expected;

    if (!isAuthed && !isLoginPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    if (isAuthed && isLoginPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }

    // Pass through with x-pathname header so layout can detect login page
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};