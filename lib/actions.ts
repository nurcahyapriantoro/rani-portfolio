'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  updateSection,
  updateBilingualSection,
  type Locale
} from '@/lib/content-store';
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
  redirect('/en/admin/dashboard');
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath('/admin');
  redirect('/en/admin/login');
}

function revalidateAll() {
  revalidatePath('/', 'layout');
  revalidatePath('/en', 'page');
  revalidatePath('/id', 'page');
  revalidatePath('/[locale]', 'page');
}

export async function updateProfileAction(enData: unknown, idData: unknown) {
  const en = profileSchema.parse(enData);
  const id = profileSchema.parse(idData);
  await updateBilingualSection(en, id, 'profile');
  revalidateAll();
  return { success: true as const };
}

export async function updateStatsAction(data: unknown) {
  const parsed = statsSchema.parse(data);
  await updateSection('en', 'stats', parsed);
  await updateSection('id', 'stats', parsed);
  revalidateAll();
  return { success: true as const };
}

export async function updateBioAction(enData: unknown, idData: unknown) {
  const en = bioSchema.parse(enData);
  const id = bioSchema.parse(idData);
  await updateBilingualSection(en, id, 'bio');
  revalidateAll();
  return { success: true as const };
}

export async function updateExperiencesAction(enData: unknown, idData: unknown) {
  const en = experiencesSchema.parse(enData);
  const id = experiencesSchema.parse(idData);
  await updateBilingualSection(en, id, 'experiences');
  revalidateAll();
  return { success: true as const };
}

export async function updateSkillsAction(enData: unknown, idData: unknown) {
  const en = skillsSchema.parse(enData);
  const id = skillsSchema.parse(idData);
  await updateBilingualSection(en, id, 'skills');
  revalidateAll();
  return { success: true as const };
}

export async function updatePublicationsAction(enData: unknown, idData: unknown) {
  const en = publicationsSchema.parse(enData);
  const id = publicationsSchema.parse(idData);
  await updateBilingualSection(en, id, 'publications');
  revalidateAll();
  return { success: true as const };
}

export async function updateAwardsAction(enData: unknown, idData: unknown) {
  const en = awardsSchema.parse(enData);
  const id = awardsSchema.parse(idData);
  await updateBilingualSection(en, id, 'awards');
  revalidateAll();
  return { success: true as const };
}

export async function updateEducationsAction(enData: unknown, idData: unknown) {
  const en = educationsSchema.parse(enData);
  const id = educationsSchema.parse(idData);
  await updateBilingualSection(en, id, 'education');
  revalidateAll();
  return { success: true as const };
}

export async function updateProjectsAction(enData: unknown, idData: unknown) {
  const en = projectsSchema.parse(enData);
  const id = projectsSchema.parse(idData);
  await updateBilingualSection(en, id, 'projects');
  revalidateAll();
  return { success: true as const };
}

export async function updateCertificationsAction(enData: unknown, idData: unknown) {
  const en = certificationsSchema.parse(enData);
  const id = certificationsSchema.parse(idData);
  await updateBilingualSection(en, id, 'certifications');
  revalidateAll();
  return { success: true as const };
}

export async function updateVolunteeringAction(enData: unknown, idData: unknown) {
  const en = volunteeringsSchema.parse(enData);
  const id = volunteeringsSchema.parse(idData);
  await updateBilingualSection(en, id, 'volunteering');
  revalidateAll();
  return { success: true as const };
}

export async function updateHeroAction(enData: unknown, idData: unknown) {
  const en = heroSchema.parse(enData);
  const id = heroSchema.parse(idData);
  await updateBilingualSection(en, id, 'hero');
  revalidateAll();
  return { success: true as const };
}

export async function updateFooterAction(enData: unknown, idData: unknown) {
  const en = footerSchema.parse(enData);
  const id = footerSchema.parse(idData);
  await updateBilingualSection(en, id, 'footer');
  revalidateAll();
  return { success: true as const };
}

export { };