'use client';

import { useActionState, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { updateAwardsAction } from '@/lib/actions';

interface Award {
  id: string;
  rank: string;
  title: string;
  issuer: string;
  date: string;
  associatedWith: string;
}

export default function AwardsEditor({ locale, awards }: { locale: string; awards: Award[] }) {
  const [list, setList] = useState<Award[]>(awards);
  const [state, formAction, pending] = useActionState(
    async (_prev: { success?: boolean } | null, fd: FormData) => {
      const payload = JSON.parse(fd.get('payload') as string);
      return await updateAwardsAction(locale as 'en' | 'id', payload);
    },
    null
  );

  const update = (i: number, field: keyof Award, value: string) => {
    setList((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const remove = (i: number) => setList((prev) => prev.filter((_, idx) => idx !== i));

  const add = () =>
    setList((prev) => [
      ...prev,
      { id: `award-${Date.now()}`, rank: '', title: '', issuer: '', date: '', associatedWith: '' }
    ]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Manage Awards</h1>
          <p className="text-text-muted text-sm">Honors and recognitions</p>
        </div>
        <button type="button" onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass hover:scale-105 transition-all">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {list.map((award, i) => (
          <div key={award.id} className="p-6 rounded-2xl glass space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-text-muted">Award #{i + 1}</span>
              <button type="button" onClick={() => remove(i)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors" aria-label="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <Input label="Rank" value={award.rank} onChange={(v) => update(i, 'rank', v)} placeholder="1st Place / Finalist / etc" />
            <Input label="Title" value={award.title} onChange={(v) => update(i, 'title', v)} />
            <Input label="Issuer" value={award.issuer} onChange={(v) => update(i, 'issuer', v)} />
            <Input label="Date" value={award.date} onChange={(v) => update(i, 'date', v)} />
            <Input label="Associated With" value={award.associatedWith} onChange={(v) => update(i, 'associatedWith', v)} />
          </div>
        ))}
      </div>

      <input type="hidden" name="payload" value={JSON.stringify(list)} />

      {state?.success && (
        <div className="px-4 py-3 rounded-xl bg-accent-soft border border-accent text-accent text-sm">
          ✓ Awards saved successfully
        </div>
      )}

      <button type="submit" disabled={pending} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-all disabled:opacity-50">
        <Save className="w-4 h-4" />
        {pending ? 'Saving...' : 'Save All'}
      </button>
    </form>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all" />
    </div>
  );
}