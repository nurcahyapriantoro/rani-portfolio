'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getContentStorage } from '@/lib/storage';
import { setSessionCookie, clearSessionCookie, getStoredPasswordHash, verifyPassword } from '@/lib/auth';
import {
  profileSchema,
  statsSchema,
  bioSchema,
  experiencesSchema,
  skillsSchema,
  publicationsSchema,
  awardsSchema,
  educationsSchema,
  projectsSchema,
  certificationsSchema,
  volunteeringsSchema,
  heroSchema,
  footerSchema
} from '@/lib/schemas';

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string;
  if (!password) {
    return { error: 'Password is required' };
  }

  const hash = await getStoredPasswordHash();
  const valid = await verifyPassword(password, hash);
  if (!valid) {
    return { error: 'Invalid password' };
  }

  await setSessionCookie();
  revalidatePath('/admin');
  redirect('/admin/dashboard');
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath('/admin');
  redirect('/admin/login');
}

function revalidateAll() {
  revalidatePath('/', 'layout');
  revalidatePath('/[locale]', 'page');
}

const storage = () => getContentStorage();

export async function updateProfileAction(enData: unknown, _idData?: unknown) {
  const en = profileSchema.parse(enData);
  await storage().updateSection('en', 'profile', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateStatsAction(data: unknown) {
  const parsed = statsSchema.parse(data);
  await storage().updateSection('en', 'stats', parsed);
  revalidateAll();
  return { success: true as const };
}

export async function updateBioAction(enData: unknown, _idData?: unknown) {
  const en = bioSchema.parse(enData);
  await storage().updateSection('en', 'bio', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateExperiencesAction(enData: unknown, _idData?: unknown) {
  const en = experiencesSchema.parse(enData);
  await storage().updateSection('en', 'experiences', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateSkillsAction(enData: unknown, _idData?: unknown) {
  const en = skillsSchema.parse(enData);
  await storage().updateSection('en', 'skills', en);
  revalidateAll();
  return { success: true as const };
}

export async function updatePublicationsAction(enData: unknown, _idData?: unknown) {
  const en = publicationsSchema.parse(enData);
  await storage().updateSection('en', 'publications', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateAwardsAction(enData: unknown, _idData?: unknown) {
  const en = awardsSchema.parse(enData);
  await storage().updateSection('en', 'awards', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateEducationsAction(enData: unknown, _idData?: unknown) {
  const en = educationsSchema.parse(enData);
  await storage().updateSection('en', 'education', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateProjectsAction(enData: unknown, _idData?: unknown) {
  const en = projectsSchema.parse(enData);
  await storage().updateSection('en', 'projects', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateCertificationsAction(enData: unknown, _idData?: unknown) {
  const en = certificationsSchema.parse(enData);
  await storage().updateSection('en', 'certifications', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateVolunteeringAction(enData: unknown, _idData?: unknown) {
  const en = volunteeringsSchema.parse(enData);
  await storage().updateSection('en', 'volunteering', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateHeroAction(enData: unknown, _idData?: unknown) {
  const en = heroSchema.parse(enData);
  await storage().updateSection('en', 'hero', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateFooterAction(enData: unknown, _idData?: unknown) {
  const en = footerSchema.parse(enData);
  await storage().updateSection('en', 'footer', en);
  revalidateAll();
  return { success: true as const };
}

export { };