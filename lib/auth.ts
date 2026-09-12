import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'rani_admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function getCookieSecret(): string | null {
  if (process.env.COOKIE_SECRET) return process.env.COOKIE_SECRET;
  return process.env.NODE_ENV === 'production' ? null : 'dev-cookie-secret-change-in-production';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getStoredPasswordHash(): Promise<string> {
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  if (envHash) return envHash;

  const plain = process.env.ADMIN_PASSWORD;
  if (!plain && process.env.NODE_ENV === 'production') {
    throw new Error('Admin credentials are not configured');
  }

  return hashPassword(plain || 'admin123');
}

export async function setSessionCookie() {
  const cookieStore = await cookies();
  const token = getCookieSecret();
  if (!token) throw new Error('COOKIE_SECRET is not configured');
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
