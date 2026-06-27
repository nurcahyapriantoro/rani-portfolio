'use client';

import { useActionState } from 'react';
import { Lock } from 'lucide-react';
import { loginAction } from '@/lib/actions';

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await loginAction(formData);
      return result;
    },
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg-primary">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-accent items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-bg-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Admin Login</h1>
          <p className="text-text-muted">Enter password to manage portfolio</p>
        </div>

        <form action={formAction} className="space-y-4 p-8 rounded-2xl glass">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all"
              placeholder="Enter admin password"
            />
          </div>

          {state?.error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full px-4 py-3 rounded-xl bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-all disabled:opacity-50"
          >
            {pending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-text-muted text-center mt-6">
          Default password: <code className="px-2 py-1 rounded bg-bg-tertiary">admin123</code>
        </p>
      </div>
    </div>
  );
}