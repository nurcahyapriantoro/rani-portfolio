import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';
import { isAuthenticated } from '@/lib/auth';

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';

  // Skip auth check on the login page itself (prevents redirect loop)
  const isLoginPath =
    pathname === '/admin/login' ||
    pathname === '/en/admin/login' ||
    pathname === '/id/admin/login' ||
    pathname.endsWith('/admin/login');

  if (isLoginPath) {
    return <>{children}</>;
  }

  const authed = await isAuthenticated();
  if (!authed) {
    redirect(`/${locale}/admin/login`);
  }
  return <>{children}</>;
}