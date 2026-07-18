'use client';

import { useEffect, useState, useTransition } from 'react';
import { Save, Check, AlertCircle, X, Loader2, BarChart3 } from 'lucide-react';
import { Field } from '@/components/admin/ui/field';
import { updateStatsAction } from '@/lib/actions';
import type { StatsInput } from '@/lib/schemas';

interface StatsEditorProps {
  stats: StatsInput;
  autoCounts: {
    experienceCount: number;
    awardsCount: number;
    publicationsCount: number;
  };
}

export default function StatsEditor({ stats, autoCounts }: StatsEditorProps) {
  const [data, setData] = useState<StatsInput>(stats);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!pending) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [pending]);

  const set = <K extends keyof StatsInput>(field: K, value: StatsInput[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const resetOverride = (field: keyof typeof autoCounts) => {
    setData((prev) => ({ ...prev, [field]: autoCounts[field] }));
    setDirty(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await updateStatsAction(data);
        if (res.success) {
          setToast({ type: 'success', message: '✓ Stats saved successfully' });
          setDirty(false);
        } else {
          setToast({ type: 'error', message: 'Save failed' });
        }
      } catch (e) {
        setToast({
          type: 'error',
          message: e instanceof Error ? e.message : 'Save failed'
        });
      }
    });
  };

  const isOverridden = (field: keyof typeof autoCounts) =>
    data[field] !== autoCounts[field];

  return (
    <div className="space-y-6 relative">
      {pending && (
        <div
          className="fixed inset-0 z-[100] bg-bg-primary/70 backdrop-blur-sm flex items-center justify-center"
          role="alert"
          aria-live="assertive"
          aria-busy="true"
        >
          <div className="bg-bg-secondary border border-accent rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-accent-soft" />
              <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
              <Save className="absolute inset-0 m-auto w-6 h-6 text-accent" />
            </div>
            <p className="font-display text-lg font-bold mb-1">Saving changes...</p>
            <p className="text-text-muted text-sm">Updating stats</p>
            <p className="text-text-muted text-xs mt-3">Do not close this window</p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Edit Stats</h1>
          <p className="text-text-muted text-sm">
            Stats shown in the photo profile (hero badge) and About section. Stats apply to both
            EN and ID locales — counts are auto-calculated from entries; override only if you
            want a different value.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-all disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px] justify-center"
        >
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save
            </>
          )}
        </button>
      </div>

      {dirty && !pending && (
        <div className="px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" />
          You have unsaved changes
        </div>
      )}

      <div
        className={`rounded-2xl glass p-6 space-y-6 transition-opacity ${pending ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Field
            label="GPA / IPK (display string)"
            value={data.gpa}
            onChange={(v) => set('gpa', v)}
            placeholder="3.77"
            hint="Shown as a small badge on the photo profile and as a stat card in About"
            fullWidth
          />
        </div>

        <div className="border-t border-border pt-5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-accent" />
            <h2 className="font-display text-base font-semibold">Auto-calculated Counts</h2>
          </div>
          <p className="text-xs text-text-muted mb-4">
            These normally equal the number of entries in their respective sections. Leave them
            untouched to keep them in sync, or override below.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-bg-tertiary/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-widest text-text-muted">
                  Experiences
                </label>
                <span className="text-[10px] font-mono text-accent">
                  auto: {autoCounts.experienceCount}
                </span>
              </div>
              <input
                type="number"
                min={0}
                value={data.experienceCount}
                onChange={(e) =>
                  set('experienceCount', Math.max(0, parseInt(e.target.value || '0', 10)))
                }
                className="w-full px-4 py-2 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all"
              />
              {isOverridden('experienceCount') && (
                <button
                  type="button"
                  onClick={() => resetOverride('experienceCount')}
                  className="text-[10px] text-accent hover:underline"
                >
                  Reset to auto ({autoCounts.experienceCount})
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl border border-border bg-bg-tertiary/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-widest text-text-muted">
                  Awards
                </label>
                <span className="text-[10px] font-mono text-accent">
                  auto: {autoCounts.awardsCount}
                </span>
              </div>
              <input
                type="number"
                min={0}
                value={data.awardsCount}
                onChange={(e) =>
                  set('awardsCount', Math.max(0, parseInt(e.target.value || '0', 10)))
                }
                className="w-full px-4 py-2 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all"
              />
              {isOverridden('awardsCount') && (
                <button
                  type="button"
                  onClick={() => resetOverride('awardsCount')}
                  className="text-[10px] text-accent hover:underline"
                >
                  Reset to auto ({autoCounts.awardsCount})
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl border border-border bg-bg-tertiary/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-widest text-text-muted">
                  Publications
                </label>
                <span className="text-[10px] font-mono text-accent">
                  auto: {autoCounts.publicationsCount}
                </span>
              </div>
              <input
                type="number"
                min={0}
                value={data.publicationsCount}
                onChange={(e) =>
                  set('publicationsCount', Math.max(0, parseInt(e.target.value || '0', 10)))
                }
                className="w-full px-4 py-2 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all"
              />
              {isOverridden('publicationsCount') && (
                <button
                  type="button"
                  onClick={() => resetOverride('publicationsCount')}
                  className="text-[10px] text-accent hover:underline"
                >
                  Reset to auto ({autoCounts.publicationsCount})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm animate-fade-up z-50 ${
            toast.type === 'success'
              ? 'bg-accent-soft border-accent text-accent'
              : 'bg-red-500/10 border-red-500 text-red-500'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 opacity-70 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}