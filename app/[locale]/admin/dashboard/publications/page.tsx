import { setRequestLocale } from 'next-intl/server';
import { getPublications } from '@/lib/content';
import PublicationsEditor from '@/components/admin/publications-editor';

export default async function PublicationsAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const publications = await getPublications(locale as 'en' | 'id');
  return <PublicationsEditor locale={locale} publications={publications} />;
}