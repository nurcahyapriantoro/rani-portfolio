import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { Education } from '@/components/sections/education';
import { Experience } from '@/components/sections/experience';
import { Skills } from '@/components/sections/skills';
import { Projects } from '@/components/sections/projects';
import { Publications } from '@/components/sections/publications';
import { Awards } from '@/components/sections/awards';
import { Contact } from '@/components/sections/contact';
import { Footer } from '@/components/sections/footer';
import {
  getProfile,
  getStats,
  getExperiences,
  getSkills,
  getPublications,
  getAwards
} from '@/lib/content';
import type { Locale } from '@/lib/content';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [profile, stats, experiences, skills, publications, awards] = await Promise.all([
    getProfile(locale as Locale),
    getStats(locale as Locale),
    getExperiences(locale as Locale),
    getSkills(locale as Locale),
    getPublications(locale as Locale),
    getAwards(locale as Locale)
  ]);

  return (
    <>
      <Hero profile={profile} />
      <About stats={stats} />
      <Education />
      <Experience experiences={experiences} />
      <Skills skills={skills} />
      <Projects />
      <Publications publications={publications} />
      <Awards awards={awards} />
      <Contact profile={profile} />
      <Footer />
    </>
  );
}