import { setRequestLocale } from 'next-intl/server';
import { getVolunteering } from '@/lib/content';
import VolunteeringEditor from '@/components/admin/volunteering-editor';

export default async function VolunteeringPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const en = await getVolunteering('en');

  return <VolunteeringEditor locale={locale} enVolunteering={en} />;
}