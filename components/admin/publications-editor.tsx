'use client';

import { useActionState, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { updatePublicationsAction } from '@/lib/actions';

interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  date: string;
  type: string;
  abstract: string;
  url: string;
}

export default function PublicationsEditor({ locale, publications }: { locale: string; publications: Publication[] }) {
  const [list, setList] = useState<Publication[]>(publications);
  const [state, formAction, pending] = useActionState(
    async (_prev: { success?: boolean } | null, fd: FormData) => {
      const payload = JSON.parse(fd.get('payload') as string);
      return await updatePublicationsAction(locale as 'en' | 'id', payload);
    },
    null
  );

  const update = (i: number, field: keyof Publication, value: unknown) => {
    setList((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const remove = (i: number) => setList((prev) => prev.filter((_, idx) => idx !== i));

  const add = () =>
    setList((prev) => [
      ...prev,
      { id: `pub-${Date.now()}`, title: '', authors: [], venue: '', date: '', type: 'journal', abstract: '', url: '' }
    ]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Manage Publications</h1>
          <p className="text-text-muted text-sm">Research papers and journal articles</p>
        </div>
        <button type="button" onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass hover:scale-105 transition-all">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="space-y-4">
        {list.map((pub, i) => (
          <div key={pub.id} className="p-6 rounded-2xl glass space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-text-muted">Publication #{i + 1}</span>
              <button type="button" onClick={() => remove(i)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors" aria-label="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <Input label="Title" value={pub.title} onChange={(v) => update(i, 'title', v)} fullWidth />
            <div className="grid md:grid-cols-3 gap-3">
              <Input label="Venue" value={pub.venue} onChange={(v) => update(i, 'venue', v)} />
              <Input label="Date" value={pub.date} onChange={(v) => update(i, 'date', v)} />
              <Input label="Type" value={pub.type} onChange={(v) => update(i, 'type', v)} />
            </div>
            <Input label="Authors (comma-separated)" value={pub.authors.join(', ')} onChange={(v) => update(i, 'authors', v.split(',').map((s) => s.trim()).filter(Boolean))} fullWidth />
            <Input label="URL" value={pub.url} onChange={(v) => update(i, 'url', v)} fullWidth />
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Abstract</label>
              <textarea
                value={pub.abstract}
                onChange={(e) => update(i, 'abstract', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      <input type="hidden" name="payload" value={JSON.stringify(list)} />

      {state?.success && (
        <div className="px-4 py-3 rounded-xl bg-accent-soft border border-accent text-accent text-sm">
          ✓ Publications saved successfully
        </div>
      )}

      <button type="submit" disabled={pending} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-all disabled:opacity-50">
        <Save className="w-4 h-4" />
        {pending ? 'Saving...' : 'Save All'}
      </button>
    </form>
  );
}

function Input({ label, value, onChange, fullWidth = false }: { label: string; value: string; onChange: (v: string) => void; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? 'md:col-span-2 lg:col-span-3' : ''}>
      <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all" />
    </div>
  );
}