import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'rani_admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

// Baked-in fallbacks so the admin panel works on Vercel without requiring
// env-var configuration. To override, set ADMIN_PASSWORD_HASH (or
// ADMIN_PASSWORD) and COOKIE_SECRET in Vercel project settings.
//
// Default password: `ranicantik`.
//   node -e "console.log(require('bcryptjs').hashSync('ranicantik', 10))"
const FALLBACK_PASSWORD_HASH =
  '$2b$10$w5zl9u.94HwbMGcsEiCNm.M.Dxca6qb7iaRNwq6JfUxslnaItbO';
const FALLBACK_COOKIE_SECRET = 'rani-cookie-fallback-7b9c4f2e8a1d6e3b5f7a9c1e';

export function getCookieSecret(): string {
  return process.env.COOKIE_SECRET || FALLBACK_COOKIE_SECRET;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getStoredPasswordHash(): Promise<string> {
  if (process.env.ADMIN_PASSWORD_HASH) return process.env.ADMIN_PASSWORD_HASH;

  if (process.env.ADMIN_PASSWORD) {
    return hashPassword(process.env.ADMIN_PASSWORD);
  }

  return FALLBACK_PASSWORD_HASH;
}

export async function setSessionCookie() {
  const cookieStore = await cookies();
  const token = getCookieSecret();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  const expected = getCookieSecret();
  return Boolean(expected && cookie?.value === expected);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
