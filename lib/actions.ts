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

type ActionResult = { success: true } | { success: false; error: string };

// Wrap every write action so it NEVER throws to the Next.js server-action
// runtime. A throw would propagate as a special RSC stream that the client
// tries to JSON.parse — which surfaces as the opaque
// "Failed to execute 'json' on 'Response': Unexpected end of JSON input".
// Returning a normal object keeps the action stream valid JSON end-to-end.
function safeAction<T>(fn: () => Promise<T>): Promise<T | { success: false; error: string }> {
  return fn().catch((e) => {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[action] unexpected error', e);
    return { success: false, error: message };
  });
}

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

const storage = () => {
  try {
    return getContentStorage();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Storage not configured';
    throw new Error(`Failed to initialise content storage: ${message}`);
  }
};

async function requireAuthentication() {
  try {
    if (!(await isAuthenticated())) {
      throw new Error('Unauthorized — please log in again');
    }
  } catch (e) {
    // Surface a friendly auth error rather than the raw boolean false
    throw e instanceof Error ? e : new Error('Unauthorized');
  }
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

function validatePortfolioPdfUrl(portfolioPdfUrl: string): string {
  const normalized = portfolioPdfUrl.trim();
  const isLocal = /^\/uploads\/portfolio\/[a-z0-9][a-z0-9-]*\.pdf$/i.test(normalized);
  let isHttpsPdf = false;
  if (normalized) {
    try {
      const url = new URL(normalized);
      isHttpsPdf = url.protocol === 'https:' && url.pathname.toLowerCase().endsWith('.pdf');
    } catch {
      isHttpsPdf = false;
    }
  }

  if (normalized && !isLocal && !isHttpsPdf) {
    throw new Error('Portfolio URL must be a public HTTPS PDF URL or a local portfolio upload path');
  }

  return normalized;
}

export async function updateProfileAction(enData: unknown, _idData?: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const en = profileSchema.parse(enData);
    en.cvUrl = validateCvUrl(en.cvUrl);
    en.portfolioPdfUrl = validatePortfolioPdfUrl(en.portfolioPdfUrl ?? '');
    await storage().updateSection('en', 'profile', en);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updateCvUrlAction(cvUrl: string): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();

    const normalizedCvUrl = validateCvUrl(cvUrl);

    const content = await storage().readContent('en');
    const profile = profileSchema.parse({ ...(content.profile as Record<string, unknown>), cvUrl: normalizedCvUrl });
    await storage().updateSection('en', 'profile', profile);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updatePortfolioPdfUrlAction(portfolioPdfUrl: string): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();

    const normalized = validatePortfolioPdfUrl(portfolioPdfUrl);

    const content = await storage().readContent('en');
    const profile = profileSchema.parse({
      ...(content.profile as Record<string, unknown>),
      portfolioPdfUrl: normalized
    });
    await storage().updateSection('en', 'profile', profile);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updateStatsAction(data: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const parsed = statsSchema.parse(data);
    await storage().updateSection('en', 'stats', parsed);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updateBioAction(enData: unknown, _idData?: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const en = bioSchema.parse(enData);
    await storage().updateSection('en', 'bio', en);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updateExperiencesAction(enData: unknown, _idData?: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const en = experiencesSchema.parse(enData);
    await storage().updateSection('en', 'experiences', en);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updateSkillsAction(enData: unknown, _idData?: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const en = skillsSchema.parse(enData);
    await storage().updateSection('en', 'skills', en);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updatePublicationsAction(enData: unknown, _idData?: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const en = publicationsSchema.parse(enData);
    await storage().updateSection('en', 'publications', en);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updateAwardsAction(enData: unknown, _idData?: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const en = awardsSchema.parse(enData);
    await storage().updateSection('en', 'awards', en);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updateEducationsAction(enData: unknown, _idData?: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const en = educationsSchema.parse(enData);
    await storage().updateSection('en', 'education', en);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updateProjectsAction(enData: unknown, _idData?: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const en = projectsSchema.parse(enData);
    await storage().updateSection('en', 'projects', en);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updateCertificationsAction(enData: unknown, _idData?: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const en = certificationsSchema.parse(enData);
    await storage().updateSection('en', 'certifications', en);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updateVolunteeringAction(enData: unknown, _idData?: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const en = volunteeringsSchema.parse(enData);
    await storage().updateSection('en', 'volunteering', en);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updateHeroAction(enData: unknown, _idData?: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const en = heroSchema.parse(enData);
    await storage().updateSection('en', 'hero', en);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export async function updateFooterAction(enData: unknown, _idData?: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAuthentication();
    const en = footerSchema.parse(enData);
    await storage().updateSection('en', 'footer', en);
    revalidateAll();
    return { success: true as const };
  }) as Promise<ActionResult>;
}

export {};
