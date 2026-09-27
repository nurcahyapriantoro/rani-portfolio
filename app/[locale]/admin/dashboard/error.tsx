'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { logoutAction } from '@/lib/actions';

// Catches any unhandled rendering error in the admin dashboard tree. Without
// this file, an exception during Server Component rendering surfaces as an
// opaque browser error (sometimes "Unexpected end of JSON input" if Next.js
// can't serialise the broken RSC stream). This component renders a usable
// error UI and lets the admin retry or log out.

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Always log the error so it remains debuggable. The "Unexpected end of
    // JSON input" message can originate from Server Actions or RSC fetches
    // — this is the cleanest place to capture the full server-side error.
    console.error('[admin/dashboard error]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack
    });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full glass rounded-2xl p-8 text-center space-y-4 border border-red-500/30">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold mb-1">Dashboard failed to load</h2>
          <p className="text-text-muted text-sm">
            We hit an unexpected error while preparing this page. Most often this is a
            temporary issue with the content store.
          </p>
        </div>
        {error.message && (
          <details className="text-left text-xs bg-bg-tertiary/50 rounded-lg p-3 border border-border">
            <summary className="cursor-pointer text-text-muted">Error details</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words text-red-500/90">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-bg-primary text-sm font-semibold hover:bg-accent-hover transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg glass text-sm hover:scale-105 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
