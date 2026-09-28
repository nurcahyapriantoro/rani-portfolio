import { NextResponse, type NextRequest } from 'next/server';
import { getUploadStorage } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';
import { MAX_PORTFOLIO_BYTES, MAX_PORTFOLIO_MB, formatMB } from '@/lib/storage/constants';

export const runtime = 'nodejs';

// Dedicated endpoint for the project portfolio PDF. Separated from the main
// /api/upload handler so the body-size guard can be raised independently
// (this endpoint accepts up to 20 MB while /api/upload keeps the 4.5 MB cap
// that protects the image-upload path).
const MAX_REQUEST_BYTES = 22 * 1024 * 1024;

function jsonError(message: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return jsonError('Unauthorized — please log in again.', 401);
    }

    const contentLengthHeader = request.headers.get('content-length');
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : 0;
    if (contentLength && contentLength > MAX_REQUEST_BYTES) {
      return jsonError(
        `Request too large (${formatMB(contentLength)}). Maximum allowed is ${formatMB(MAX_PORTFOLIO_BYTES)}. ` +
          `Please compress the PDF and try again.`,
        413
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to read multipart body';
      return jsonError(
        `Could not read upload body: ${msg}. The file may be too large (max ${formatMB(MAX_PORTFOLIO_BYTES)}) or malformed.`,
        400
      );
    }

    const files = formData.getAll('files').filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return jsonError('No files included in request.', 400);
    }
    if (files.length !== 1) {
      return jsonError('Please upload one portfolio PDF at a time.', 400);
    }

    const file = files[0];
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      return jsonError(`"${file.name}" is not a PDF. Please upload a PDF file.`, 400);
    }
    if (file.size === 0) {
      return jsonError('PDF cannot be empty.', 400);
    }
    if (file.size > MAX_PORTFOLIO_BYTES) {
      return jsonError(
        `"${file.name}" is ${formatMB(file.size)}. Maximum portfolio size is ${formatMB(MAX_PORTFOLIO_BYTES)} ` +
          `(${MAX_PORTFOLIO_MB.toFixed(0)} MB). Please compress the PDF and try again.`,
        400
      );
    }

    const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (String.fromCharCode(...signature) !== '%PDF-') {
      return jsonError('The selected file is not a valid PDF.', 400);
    }

    let storage;
    try {
      storage = getUploadStorage();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Storage not configured.';
      console.error('[api/portfolio-upload] storage init failed', e);
      return jsonError(
        `Upload service is not configured on this deployment: ${msg}. ` +
          `Set BLOB_READ_WRITE_TOKEN (recommended) or GH_TOKEN in your Vercel environment variables.`,
        503
      );
    }

    const hint = (formData.get('hint') as string) ?? file.name;
    let result;
    try {
      result = await storage.saveUpload(file, 'portfolio', hint);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed.';
      console.error('[api/portfolio-upload] saveUpload threw', e);
      return jsonError(
        `Upload failed while saving "${file.name}": ${msg}. ` +
          `Maximum portfolio size is ${formatMB(MAX_PORTFOLIO_BYTES)}.`,
        500
      );
    }

    if (!result.ok) {
      const errorWithCap = /MB|MB\)|max|limit/i.test(result.error)
        ? result.error
        : `${result.error} Maximum portfolio size is ${formatMB(MAX_PORTFOLIO_BYTES)}.`;
      return jsonError(errorWithCap, 400);
    }

    return NextResponse.json({
      ok: true,
      files: [{ url: result.url, filename: result.filename }]
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    console.error('[api/portfolio-upload] uncaught error', e);
    return jsonError(
      `Upload failed: ${message}. Maximum portfolio size is ${formatMB(MAX_PORTFOLIO_BYTES)}.`,
      500
    );
  }
}
