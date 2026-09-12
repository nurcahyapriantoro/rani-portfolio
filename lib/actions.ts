'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getContentStorage } from '@/lib/storage';
import { setSessionCookie, clearSessionCookie, getStoredPasswordHash, isAuthenticated, verifyPassword } from '@/lib/auth';
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
}

const storage = () => getContentStorage();

async function requireAuthentication() {
  if (!(await isAuthenticated())) throw new Error('Unauthorized');
}

function validateCvUrl(cvUrl: string): string {
  const normalizedCvUrl = cvUrl.trim();
  const isLocalCv = /^\/uploads\/cv\/[a-z0-9][a-z0-9-]*\.pdf$/i.test(normalizedCvUrl);
  let isHttpsPdf = false;
  if (normalizedCvUrl) {
    try {
      const url = new URL(normalizedCvUrl);
      isHttpsPdf = url.protocol === 'https:' && url.pathname.toLowerCase().endsWith('.pdf');
    } catch {
      isHttpsPdf = false;
    }
  }

  if (normalizedCvUrl && !isLocalCv && !isHttpsPdf) {
    throw new Error('CV URL must be a public HTTPS PDF URL or a local CV upload path');
  }

  return normalizedCvUrl;
}

export async function updateProfileAction(enData: unknown, _idData?: unknown) {
  await requireAuthentication();
  const en = profileSchema.parse(enData);
  en.cvUrl = validateCvUrl(en.cvUrl);
  await storage().updateSection('en', 'profile', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateCvUrlAction(cvUrl: string) {
  await requireAuthentication();

  const normalizedCvUrl = validateCvUrl(cvUrl);

  const content = await storage().readContent('en');
  const profile = profileSchema.parse({ ...(content.profile as Record<string, unknown>), cvUrl: normalizedCvUrl });
  await storage().updateSection('en', 'profile', profile);
  revalidateAll();
  return { success: true as const };
}

export async function updateStatsAction(data: unknown) {
  await requireAuthentication();
  const parsed = statsSchema.parse(data);
  await storage().updateSection('en', 'stats', parsed);
  revalidateAll();
  return { success: true as const };
}

export async function updateBioAction(enData: unknown, _idData?: unknown) {
  await requireAuthentication();
  const en = bioSchema.parse(enData);
  await storage().updateSection('en', 'bio', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateExperiencesAction(enData: unknown, _idData?: unknown) {
  await requireAuthentication();
  const en = experiencesSchema.parse(enData);
  await storage().updateSection('en', 'experiences', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateSkillsAction(enData: unknown, _idData?: unknown) {
  await requireAuthentication();
  const en = skillsSchema.parse(enData);
  await storage().updateSection('en', 'skills', en);
  revalidateAll();
  return { success: true as const };
}

export async function updatePublicationsAction(enData: unknown, _idData?: unknown) {
  await requireAuthentication();
  const en = publicationsSchema.parse(enData);
  await storage().updateSection('en', 'publications', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateAwardsAction(enData: unknown, _idData?: unknown) {
  await requireAuthentication();
  const en = awardsSchema.parse(enData);
  await storage().updateSection('en', 'awards', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateEducationsAction(enData: unknown, _idData?: unknown) {
  await requireAuthentication();
  const en = educationsSchema.parse(enData);
  await storage().updateSection('en', 'education', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateProjectsAction(enData: unknown, _idData?: unknown) {
  await requireAuthentication();
  const en = projectsSchema.parse(enData);
  await storage().updateSection('en', 'projects', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateCertificationsAction(enData: unknown, _idData?: unknown) {
  await requireAuthentication();
  const en = certificationsSchema.parse(enData);
  await storage().updateSection('en', 'certifications', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateVolunteeringAction(enData: unknown, _idData?: unknown) {
  await requireAuthentication();
  const en = volunteeringsSchema.parse(enData);
  await storage().updateSection('en', 'volunteering', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateHeroAction(enData: unknown, _idData?: unknown) {
  await requireAuthentication();
  const en = heroSchema.parse(enData);
  await storage().updateSection('en', 'hero', en);
  revalidateAll();
  return { success: true as const };
}

export async function updateFooterAction(enData: unknown, _idData?: unknown) {
  await requireAuthentication();
  const en = footerSchema.parse(enData);
  await storage().updateSection('en', 'footer', en);
  revalidateAll();
  return { success: true as const };
}

export { };
