import 'server-only';
import { readContent, type Locale } from './content-store';
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

export async function getProfile(locale: Locale): Promise<ProfileInput> {
  const data = await readContent(locale);
  return data.profile as ProfileInput;
}

export async function getStats(locale: Locale): Promise<StatsInput> {
  const data = await readContent(locale);
  return data.stats as StatsInput;
}

export async function getBio(locale: Locale): Promise<BioInput> {
  const data = await readContent(locale);
  return (data.bio as BioInput) ?? { short: '', long: '' };
}

export async function getExperiences(locale: Locale): Promise<ExperienceInput[]> {
  const data = await readContent(locale);
  return (data.experiences as ExperienceInput[]) ?? [];
}

export async function getSkills(locale: Locale): Promise<SkillInput[]> {
  const data = await readContent(locale);
  return (data.skills as SkillInput[]) ?? [];
}

export async function getPublications(locale: Locale): Promise<PublicationInput[]> {
  const data = await readContent(locale);
  return (data.publications as PublicationInput[]) ?? [];
}

export async function getAwards(locale: Locale): Promise<AwardInput[]> {
  const data = await readContent(locale);
  return (data.awards as AwardInput[]) ?? [];
}

export async function getCertifications(locale: Locale): Promise<CertificationInput[]> {
  const data = await readContent(locale);
  return (data.certifications as CertificationInput[]) ?? [];
}

export async function getVolunteering(locale: Locale): Promise<VolunteeringInput[]> {
  const data = await readContent(locale);
  return (data.volunteering as VolunteeringInput[]) ?? [];
}

export async function getEducations(locale: Locale): Promise<EducationInput[]> {
  const data = await readContent(locale);
  return (data.education as EducationInput[]) ?? [];
}

export async function getProjects(locale: Locale): Promise<ProjectInput[]> {
  const data = await readContent(locale);
  return (data.projects as ProjectInput[]) ?? [];
}

export async function getHero(locale: Locale): Promise<HeroInput> {
  const data = await readContent(locale);
  return (data.hero as HeroInput) ?? { greeting: '', scrollLabel: '' };
}

export async function getFooter(locale: Locale): Promise<FooterInput> {
  const data = await readContent(locale);
  return (data.footer as FooterInput) ?? { copyright: '', tagline: '', builtWith: '', socials: [] };
}