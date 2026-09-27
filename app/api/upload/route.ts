import { NextResponse, type NextRequest } from 'next/server';
import { getUploadStorage } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  MAX_CV_BYTES,
  MAX_CV_MB,
  formatMB
} from '@/lib/storage/constants';

export const runtime = 'nodejs';

// Vercel Serverless Function request body limit on the Hobby plan is 4.5 MB.
// Multipart/form-data overhead plus base64 inflation (for the GitHub backend)
// means we cap the raw file at 3.5 MB. Reject oversized requests early with a
// clear JSON error instead of letting Vercel close the connection with an
// empty body — that's what produced the opaque "Unexpected end of JSON input"
// client-side error.
const MAX_REQUEST_BYTES = 4.5 * 1024 * 1024;

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

function jsonError(message: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json(
    { ok: false, error: message, ...extra },
    { status }
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return jsonError('Unauthorized — please log in again.', 401);
    }

    // Guard against oversized requests BEFORE parsing the body so the client
    // always receives a JSON error instead of an opaque empty body.
    const contentLengthHeader = request.headers.get('content-length');
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : 0;
    if (contentLength && contentLength > MAX_REQUEST_BYTES) {
      return jsonError(
        `Request too large (${formatMB(contentLength)}). Maximum allowed is ${formatMB(MAX_UPLOAD_BYTES)}. ` +
          `Please compress or resize your image and try again.`,
        413
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to read multipart body';
      // Body may exceed Vercel's limit or be malformed; surface a clear JSON
      // error instead of bubbling up an empty 500.
      return jsonError(
        `Could not read upload body: ${msg}. The file may be too large (max ${formatMB(MAX_UPLOAD_BYTES)}) or malformed.`,
        400
      );
    }

    const section = (formData.get('section') as string) ?? 'misc';
    if (!ALLOWED_SECTIONS.has(section)) {
      return jsonError(`Invalid section: ${section}.`, 400);
    }

    const files = formData.getAll('files').filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return jsonError('No files included in request.', 400);
    }

    if (section === 'cv') {
      if (files.length !== 1) {
        return jsonError('Please upload one CV at a time.', 400);
      }

      const file = files[0];
      if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
        return jsonError(`"${file.name}" is not a PDF. Please upload a PDF file.`, 400);
      }
      if (file.size === 0) {
        return jsonError('PDF cannot be empty.', 400);
      }
      if (file.size > MAX_CV_BYTES) {
        return jsonError(
          `"${file.name}" is ${formatMB(file.size)}. Maximum CV size is ${formatMB(MAX_CV_BYTES)}. ` +
            `Please compress the PDF and try again.`,
          400
        );
      }

      const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
      if (String.fromCharCode(...signature) !== '%PDF-') {
        return jsonError('The selected file is not a valid PDF.', 400);
      }
    }

    // Surface storage-not-configured clearly to the user (instead of an opaque
    // empty 500 from Vercel when getUploadStorage() throws).
    let storage;
    try {
      storage = getUploadStorage();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Storage not configured.';
      console.error('[api/upload] storage init failed', e);
      return jsonError(
        `Upload service is not configured on this deployment: ${msg}. ` +
          `Set BLOB_READ_WRITE_TOKEN (recommended) or GH_TOKEN in your Vercel environment variables.`,
        503
      );
    }

    const results: Array<{ url: string; filename: string }> = [];
    for (const file of files) {
      const hint = (formData.get('hint') as string) ?? file.name;
      let result;
      try {
        result = await storage.saveUpload(file, section, hint);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Save failed.';
        console.error('[api/upload] saveUpload threw', e);
        return jsonError(
          `Upload failed while saving "${file.name}": ${msg}. ` +
            `Maximum upload size is ${formatMB(MAX_UPLOAD_BYTES)}.`,
          500
        );
      }
      if (!result.ok) {
        // Trust the storage backend's user-friendly error. If it doesn't
        // mention the cap, append it for clarity.
        const errorWithCap = /MB|MB\)|max|limit/i.test(result.error)
          ? result.error
          : `${result.error} Maximum upload size is ${formatMB(MAX_UPLOAD_BYTES)}.`;
        return jsonError(errorWithCap, 400, { files: results });
      }
      results.push({ url: result.url, filename: result.filename });
    }

    return NextResponse.json({ ok: true, files: results });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    console.error('[api/upload] uncaught error', e);
    return jsonError(
      `Upload failed: ${message}. Maximum upload size is ${formatMB(MAX_UPLOAD_BYTES)}.`,
      500
    );
  }
}
