import { setRequestLocale } from 'next-intl/server';
import { getSkills } from '@/lib/content';
import SkillsEditor from '@/components/admin/skills-editor';

export default async function SkillsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const enSkills = await getSkills('en');

  return <SkillsEditor locale={locale} enSkills={enSkills} />;
}