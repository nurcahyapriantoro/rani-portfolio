import { setRequestLocale } from 'next-intl/server';
import { getPublications } from '@/lib/content';
import PublicationsEditor from '@/components/admin/publications-editor';

export default async function PublicationsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const en = await getPublications('en');

  return <PublicationsEditor locale={locale} enPublications={en} />;
}