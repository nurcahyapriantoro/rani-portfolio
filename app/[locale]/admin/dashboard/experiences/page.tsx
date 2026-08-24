import { setRequestLocale } from 'next-intl/server';
import { getExperiences } from '@/lib/content';
import ExperiencesEditor from '@/components/admin/experiences-editor';

export default async function ExperiencesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const enExperiences = await getExperiences('en');

  return (
    <ExperiencesEditor
      locale={locale}
      enExperiences={enExperiences}
    />
  );
}