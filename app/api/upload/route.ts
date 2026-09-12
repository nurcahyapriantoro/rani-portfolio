import { NextResponse, type NextRequest } from 'next/server';
import { getUploadStorage } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';

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
  'cv',
  'misc'
]);

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();

  const section = (formData.get('section') as string) ?? 'misc';
  if (!ALLOWED_SECTIONS.has(section)) {
    return NextResponse.json({ ok: false, error: 'Invalid section' }, { status: 400 });
  }

  const files = formData.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: 'No files' }, { status: 400 });
  }

  if (section === 'cv') {
    if (files.length !== 1) {
      return NextResponse.json({ ok: false, error: 'Upload one CV at a time' }, { status: 400 });
    }

    const file = files[0];
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ ok: false, error: 'Only PDF files are allowed' }, { status: 400 });
    }
    if (file.size === 0 || file.size > 1024 * 1024) {
      return NextResponse.json({ ok: false, error: 'PDF must be between 1 byte and 1MB' }, { status: 400 });
    }

    const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (String.fromCharCode(...signature) !== '%PDF-') {
      return NextResponse.json({ ok: false, error: 'The selected file is not a valid PDF' }, { status: 400 });
    }
  }

  const storage = getUploadStorage();
  const results: Array<{ url: string; filename: string }> = [];
  for (const file of files) {
    const hint = (formData.get('hint') as string) ?? file.name;
    const result = await storage.saveUpload(file, section, hint);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error, files: results }, { status: 400 });
    }
    results.push({ url: result.url, filename: result.filename });
  }

  return NextResponse.json({ ok: true, files: results });
}
