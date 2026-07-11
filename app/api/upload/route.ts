import { NextResponse, type NextRequest } from 'next/server';
import { saveUpload } from '@/lib/upload';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

const ALLOWED_SECTIONS = new Set([
  'experiences',
  'projects',
  'certifications',
  'volunteering',
  'publications',
  'awards',
  'profile',
  'education',
  'misc'
]);

const COOKIE_NAME = 'rani_admin_session';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  const expected = process.env.COOKIE_SECRET || 'dev-cookie-secret-change-in-production';
  if (!sessionCookie || sessionCookie !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const section = (formData.get('section') as string) ?? 'misc';
  if (!ALLOWED_SECTIONS.has(section)) {
    return NextResponse.json({ ok: false, error: 'Invalid section' }, { status: 400 });
  }

  const files = formData.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: 'No files' }, { status: 400 });
  }

  const results: Array<{ url: string; filename: string }> = [];
  for (const file of files) {
    const hint = (formData.get('hint') as string) ?? file.name;
    const result = await saveUpload(file, section, hint);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error, files: results }, { status: 400 });
    }
    results.push({ url: result.url, filename: result.filename });
  }

  return NextResponse.json({ ok: true, files: results });
}