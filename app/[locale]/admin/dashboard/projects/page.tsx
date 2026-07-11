import { setRequestLocale } from 'next-intl/server';
import { getProjects } from '@/lib/content';
import ProjectsEditor from '@/components/admin/projects-editor';

export default async function ProjectsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [en, id] = await Promise.all([getProjects('en'), getProjects('id')]);

  return <ProjectsEditor locale={locale} enProjects={en} idProjects={id} />;
}