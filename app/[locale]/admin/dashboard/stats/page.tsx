import { setRequestLocale } from 'next-intl/server';
import {
  getStats,
  getExperiences,
  getAwards,
  getPublications,
  type Locale
} from '@/lib/content';
import StatsEditor from '@/components/admin/stats-editor';

export default async function StatsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [stats, experiences, awards, publications] = await Promise.all([
    getStats(locale as Locale),
    getExperiences(locale as Locale),
    getAwards(locale as Locale),
    getPublications(locale as Locale)
  ]);

  const autoCounts = {
    experienceCount: experiences.length,
    awardsCount: awards.length,
    publicationsCount: publications.length
  };

  return <StatsEditor stats={stats} autoCounts={autoCounts} />;
}