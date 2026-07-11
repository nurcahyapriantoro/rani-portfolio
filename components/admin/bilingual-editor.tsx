'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { Save, Check, AlertCircle, X, Loader2 } from 'lucide-react';

interface BilingualEditorProps<T> {
  title: string;
  description?: string;
  enData: T;
  idData: T;
  onSave: (enData: T, idData: T) => Promise<{ success: boolean; error?: string }>;
  renderForm: (
    data: T,
    onChange: (updater: (prev: T) => T) => void,
    locale: 'en' | 'id'
  ) => React.ReactNode;
  headerActions?: React.ReactNode;
}

export function BilingualEditor<T>({
  title,
  description,
  enData: initialEn,
  idData: initialId,
  onSave,
  renderForm,
  headerActions
}: BilingualEditorProps<T>) {
  const [en, setEn] = useState<T>(initialEn);
  const [id, setId] = useState<T>(initialId);
  const [activeTab, setActiveTab] = useState<'en' | 'id'>('en');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);
  const [saveStage, setSaveStage] = useState<string>('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Block browser back/close while saving
  useEffect(() => {
    if (!pending) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [pending]);

  const updateEn = (updater: (prev: T) => T) => {
    setEn((prev) => {
      const next = updater(prev);
      setDirty(true);
      return next;
    });
  };

  const updateId = (updater: (prev: T) => T) => {
    setId((prev) => {
      const next = updater(prev);
      setDirty(true);
      return next;
    });
  };

  const copyEnToId = () => {
    setId(JSON.parse(JSON.stringify(en)));
    setDirty(true);
  };

  const handleSave = () => {
    setSaveStage('Saving English...');
    startTransition(async () => {
      try {
        setSaveStage('Committing English to GitHub...');
        const res = await onSave(en, id);
        if (res.success) {
          setSaveStage('Done');
          setToast({ type: 'success', message: '✓ Saved to GitHub successfully' });
          setDirty(false);
        } else {
          setToast({ type: 'error', message: res.error ?? 'Save failed' });
        }
      } catch (e) {
        setToast({
          type: 'error',
          message: e instanceof Error ? e.message : 'Save failed'
        });
      } finally {
        setSaveStage('');
      }
    });
  };

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
            <p className="text-text-muted text-sm">{saveStage || 'Please wait'}</p>
            <p className="text-text-muted text-xs mt-3">Do not close this window</p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">{title}</h1>
          {description && <p className="text-text-muted text-sm">{description}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {headerActions}
          <button
            type="button"
            onClick={copyEnToId}
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-xs hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            title="Copy English values to Indonesian as a starting point"
          >
            <span className="font-mono">EN → ID</span>
          </button>
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
                Save All
              </>
            )}
          </button>
        </div>
      </div>

      {dirty && !pending && (
        <div className="px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" />
          You have unsaved changes
        </div>
      )}

      <div className="flex items-center gap-1 border-b border-border">
        {(['en', 'id'] as const).map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => setActiveTab(loc)}
            disabled={pending}
            className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors border-b-2 -mb-px disabled:opacity-50 ${
              activeTab === loc
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {loc === 'en' ? 'English' : 'Indonesia'}
          </button>
        ))}
      </div>

      <div
        className={`rounded-2xl glass p-6 transition-opacity ${pending ? 'opacity-50 pointer-events-none' : ''}`}
        aria-hidden={pending}
      >
        {activeTab === 'en' ? renderForm(en, updateEn, 'en') : renderForm(id, updateId, 'id')}
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