import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './lib/routing';

const intlMiddleware = createIntlMiddleware(routing);

const ADMIN_COOKIE = 'rani_admin_session';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get(ADMIN_COOKIE)?.value;
    const isLogin = pathname.startsWith('/admin/login');

    if (!session && !isLogin) {
      const locale = routing.defaultLocale;
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin/login`;
      return NextResponse.redirect(url);
    }

    if (session && isLogin) {
      const locale = routing.defaultLocale;
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin/dashboard`;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};