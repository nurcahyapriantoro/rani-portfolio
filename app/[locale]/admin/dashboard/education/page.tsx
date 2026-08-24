import { setRequestLocale } from 'next-intl/server';
import { getEducations } from '@/lib/content';
import EducationEditor from '@/components/admin/education-editor';

export default async function EducationPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const en = await getEducations('en');

  return <EducationEditor locale={locale} enEducations={en} />;
}