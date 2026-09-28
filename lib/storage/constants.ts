// Shared upload limits used by both the client-side pickers and the
// /api/upload server handler. Keep the two in sync so an over-sized file
// is always rejected with the same user-facing message wherever the check
// runs first.
//
// Vercel Serverless Function request body limit on the Hobby plan is 4.5 MB,
// so we cap raw file uploads at 3.5 MB to leave headroom for multipart
// headers and (in the GitHub backend) base64 inflation.
//
// Exported so the gallery/picker components can show the limit in copy.

export const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;
export const MAX_CV_BYTES = 1 * 1024 * 1024;
export const MAX_PORTFOLIO_BYTES = 20 * 1024 * 1024;

export const MAX_UPLOAD_MB = MAX_UPLOAD_BYTES / 1024 / 1024;
export const MAX_CV_MB = MAX_CV_BYTES / 1024 / 1024;
export const MAX_PORTFOLIO_MB = MAX_PORTFOLIO_BYTES / 1024 / 1024;

export function formatMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// Build a copy-friendly error string the picker can render verbatim.
export function overSizeMessage(
  fileName: string,
  sizeBytes: number,
  maxBytes: number = MAX_UPLOAD_BYTES
): string {
  return (
    `"${fileName}" is ${formatMB(sizeBytes)}. ` +
    `Maximum upload size is ${formatMB(maxBytes)}. ` +
    `Please compress or resize the image and try again.`
  );
}

export const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
]);

export function isAllowedImageMime(file: File): boolean {
  return ALLOWED_IMAGE_MIME.has(file.type) || file.type.startsWith('image/');
}
