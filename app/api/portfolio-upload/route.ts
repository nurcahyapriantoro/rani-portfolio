import { NextResponse, type NextRequest } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { isAuthenticated } from '@/lib/auth';
import { MAX_PORTFOLIO_BYTES } from '@/lib/storage/constants';

export const runtime = 'nodejs';

// Direct-upload endpoint for the project portfolio PDF.
//
// Why this is a separate route from `/api/upload`: Vercel Hobby/Pro serverless
// functions cap request bodies at ~4.5 MB. The portfolio is allowed up to
// 20 MB, so we can't pipe the PDF through Next.js at all. Instead we use
// `@vercel/blob/client`, which lets the browser PUT the file directly to the
// blob store:
//
//   1. Client calls `upload(pathname, file, { handleUploadUrl: '/api/portfolio-upload' })`
//   2. SDK POSTs a tiny JSON event here (no file body) asking for a signed token.
//   3. We validate auth + size + content-type and return the token.
//   4. The SDK uploads the file directly to Vercel Blob storage.
//   5. After the upload completes, the SDK POSTs a second event here which we
//      acknowledge and (optionally) use to react in our own storage.
//
// This means the PDF bytes never traverse a serverless function — Vercel Blob
// receives them straight from the browser.

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: 'Unauthorized — please log in again.' },
      { status: 401 }
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.toLowerCase().endsWith('.pdf')) {
          throw new Error('Only PDF files are allowed');
        }
        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: MAX_PORTFOLIO_BYTES,
          addRandomSuffix: true,
          // Random suffix keeps URLs unique even when the same filename is uploaded twice.
          allowOverwrite: false
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // No-op: the admin form persists the resulting URL to Postgres when the
        // user clicks "Save Portfolio". Logging the URL makes debugging easier.
        console.log('[portfolio-upload] completed:', blob.url, blob.pathname);
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error('[portfolio-upload] handleUpload failed', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
