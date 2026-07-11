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

  const [en, id] = await Promise.all([getVolunteering('en'), getVolunteering('id')]);

  return <VolunteeringEditor locale={locale} enVolunteering={en} idVolunteering={id} />;
}