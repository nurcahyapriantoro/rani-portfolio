'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { readContent, writeContent, type Locale } from '@/lib/content';
import { setSessionCookie, clearSessionCookie, getStoredPasswordHash, verifyPassword } from '@/lib/auth';

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

export async function updateProfileAction(locale: Locale, data: unknown) {
  const content = await readContent(locale);
  content.profile = data;
  await writeContent(locale, content);
  revalidatePath(`/${locale}`);
  return { success: true };
}

export async function updateStatsAction(locale: Locale, data: unknown) {
  const content = await readContent(locale);
  content.stats = data;
  await writeContent(locale, content);
  revalidatePath(`/${locale}`);
  return { success: true };
}

export async function updateExperiencesAction(locale: Locale, data: unknown[]) {
  const content = await readContent(locale);
  content.experiences = data;
  await writeContent(locale, content);
  revalidatePath(`/${locale}`);
  return { success: true };
}

export async function updateSkillsAction(locale: Locale, data: unknown[]) {
  const content = await readContent(locale);
  content.skills = data;
  await writeContent(locale, content);
  revalidatePath(`/${locale}`);
  return { success: true };
}

export async function updatePublicationsAction(locale: Locale, data: unknown[]) {
  const content = await readContent(locale);
  content.publications = data;
  await writeContent(locale, content);
  revalidatePath(`/${locale}`);
  return { success: true };
}

export async function updateAwardsAction(locale: Locale, data: unknown[]) {
  const content = await readContent(locale);
  content.awards = data;
  await writeContent(locale, content);
  revalidatePath(`/${locale}`);
  return { success: true };
}