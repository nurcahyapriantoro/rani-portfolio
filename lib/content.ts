import fs from 'fs/promises';
import path from 'path';

export type Locale = 'en' | 'id';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function readContent(locale: Locale) {
  const filePath = path.join(CONTENT_DIR, `${locale}.json`);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

export async function writeContent(locale: Locale, data: unknown) {
  const filePath = path.join(CONTENT_DIR, `${locale}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getProfile(locale: Locale) {
  const data = await readContent(locale);
  return data.profile;
}

export async function getStats(locale: Locale) {
  const data = await readContent(locale);
  return data.stats;
}

export async function getExperiences(locale: Locale) {
  const data = await readContent(locale);
  return data.experiences;
}

export async function getSkills(locale: Locale) {
  const data = await readContent(locale);
  return data.skills;
}

export async function getPublications(locale: Locale) {
  const data = await readContent(locale);
  return data.publications;
}

export async function getAwards(locale: Locale) {
  const data = await readContent(locale);
  return data.awards;
}

export async function getCertifications(locale: Locale) {
  const data = await readContent(locale);
  return data.certifications;
}

export async function getVolunteering(locale: Locale) {
  const data = await readContent(locale);
  return data.volunteering;
}