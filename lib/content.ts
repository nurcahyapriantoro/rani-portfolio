import 'server-only';
import { readContent, type Locale } from './storage';
import type {
  ProfileInput,
  StatsInput,
  BioInput,
  ExperienceInput,
  SkillInput,
  PublicationInput,
  AwardInput,
  EducationInput,
  ProjectInput,
  CertificationInput,
  VolunteeringInput,
  HeroInput,
  FooterInput
} from './schemas';

export type { Locale };

/**
 * Wraps a single-section read so that storage failures (e.g. Postgres auth,
 * network, GitHub 5xx) NEVER bubble up to a Server Component. The page must
 * render even when the backend is briefly unavailable — the admin gets to
 * see an empty state and the public site never goes down because of an
 * outage on the CMS side. Errors are logged so they remain debuggable.
 */
async function safeRead<T>(
  locale: Locale,
  section: string,
  fallback: T
): Promise<T> {
  try {
    const data = await readContent(locale);
    const value = (data as Record<string, unknown>)[section];
    if (value === undefined || value === null) return fallback;
    return value as T;
  } catch (e) {
    // Never let a storage failure take down the whole page. Log so the
    // problem stays visible in the platform's error stream but degrade
    // gracefully so the user sees the empty state, not a broken app.
    console.error(`[content] failed to read section "${section}" for locale "${locale}"`, e);
    return fallback;
  }
}

export async function getProfile(locale: Locale): Promise<ProfileInput> {
  return safeRead<ProfileInput>(locale, 'profile', {} as ProfileInput);
}

export async function getStats(locale: Locale): Promise<StatsInput> {
  return safeRead<StatsInput>(locale, 'stats', {} as StatsInput);
}

export async function getBio(locale: Locale): Promise<BioInput> {
  return safeRead<BioInput>(locale, 'bio', { short: '', long: '' });
}

export async function getExperiences(locale: Locale): Promise<ExperienceInput[]> {
  const result = await safeRead<ExperienceInput[] | undefined>(locale, 'experiences', []);
  return Array.isArray(result) ? result : [];
}

export async function getSkills(locale: Locale): Promise<SkillInput[]> {
  const result = await safeRead<SkillInput[] | undefined>(locale, 'skills', []);
  return Array.isArray(result) ? result : [];
}

export async function getPublications(locale: Locale): Promise<PublicationInput[]> {
  const result = await safeRead<PublicationInput[] | undefined>(locale, 'publications', []);
  return Array.isArray(result) ? result : [];
}

export async function getAwards(locale: Locale): Promise<AwardInput[]> {
  const result = await safeRead<AwardInput[] | undefined>(locale, 'awards', []);
  return Array.isArray(result) ? result : [];
}

export async function getCertifications(locale: Locale): Promise<CertificationInput[]> {
  const result = await safeRead<CertificationInput[] | undefined>(locale, 'certifications', []);
  return Array.isArray(result) ? result : [];
}

export async function getVolunteering(locale: Locale): Promise<VolunteeringInput[]> {
  const result = await safeRead<VolunteeringInput[] | undefined>(locale, 'volunteering', []);
  return Array.isArray(result) ? result : [];
}

export async function getEducations(locale: Locale): Promise<EducationInput[]> {
  const result = await safeRead<EducationInput[] | undefined>(locale, 'education', []);
  return Array.isArray(result) ? result : [];
}

export async function getProjects(locale: Locale): Promise<ProjectInput[]> {
  const result = await safeRead<ProjectInput[] | undefined>(locale, 'projects', []);
  return Array.isArray(result) ? result : [];
}

export async function getHero(locale: Locale): Promise<HeroInput> {
  return safeRead<HeroInput>(locale, 'hero', { greeting: '', scrollLabel: '' });
}

export async function getFooter(locale: Locale): Promise<FooterInput> {
  return safeRead<FooterInput>(locale, 'footer', {
    copyright: '',
    tagline: '',
    builtWith: '',
    socials: []
  });
}
