import { setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

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
  getBio,
  getExperiences,
  getSkills,
  getPublications,
  getAwards,
  getEducations,
  getProjects,
  getHero,
  getFooter,
  getCertifications,
  getVolunteering,
  type Locale
} from '@/lib/content';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [
    profile,
    stats,
    bio,
    experiences,
    skills,
    publications,
    awards,
    educations,
    projects,
    hero,
    footer,
    certifications,
    volunteering
  ] = await Promise.all([
    getProfile(locale as Locale),
    getStats(locale as Locale),
    getBio(locale as Locale),
    getExperiences(locale as Locale),
    getSkills(locale as Locale),
    getPublications(locale as Locale),
    getAwards(locale as Locale),
    getEducations(locale as Locale),
    getProjects(locale as Locale),
    getHero(locale as Locale),
    getFooter(locale as Locale),
    getCertifications(locale as Locale),
    getVolunteering(locale as Locale)
  ]);

  return (
    <>
      <Hero profile={profile} hero={hero} gpa={stats.gpa} />
      <About bio={bio} stats={stats} />
      <Education educations={educations} />
      <Experience experiences={experiences} />
      <Skills skills={skills} />
      <Projects projects={projects} certifications={certifications} volunteering={volunteering} />
      <Publications publications={publications} />
      <Awards awards={awards} />
      <Contact profile={profile} />
      <Footer profile={profile} footer={footer} />
    </>
  );
}