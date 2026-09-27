import { NextResponse } from 'next/server';
import { detectUploadBackend, detectContentBackend } from '@/lib/storage/index';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Diagnostic endpoint. GET /api/_debug/storage returns the resolved storage
// backends (no secrets) so we can verify what the production runtime sees
// for the upload/config env vars. This is what users see when they hit a
// "storage not configured" error — and what an admin can curl to confirm
// the actual environment was rebuilt with BLOB_READ_WRITE_TOKEN.

function mask(value: string | undefined, keep = 6): string {
  if (!value) return '(not set)';
  if (value.length <= keep * 2) return '***';
  return `${value.slice(0, keep)}…${value.slice(-keep)}`;
}

export async function GET() {
  return NextResponse.json({
    onVercel: Boolean(process.env.VERCEL),
    vercelEnv: process.env.VERCEL_ENV ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
    backends: {
      content: detectContentBackend(),
      upload: detectUploadBackend()
    },
    env: {
      SUPABASE_DB_URL: mask(process.env.SUPABASE_DB_URL),
      DATABASE_URL: mask(process.env.DATABASE_URL),
      BLOB_READ_WRITE_TOKEN: mask(process.env.BLOB_READ_WRITE_TOKEN),
      GH_TOKEN: mask(process.env.GH_TOKEN),
      GITHUB_TOKEN: mask(process.env.GITHUB_TOKEN),
      KV_REST_API_URL: mask(process.env.KV_REST_API_URL),
      KV_REST_API_TOKEN: mask(process.env.KV_REST_API_TOKEN)
    },
    timestamp: new Date().toISOString()
  });
}
