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

  const [en, id] = await Promise.all([getEducations('en'), getEducations('id')]);

  return <EducationEditor locale={locale} enEducations={en} idEducations={id} />;
}