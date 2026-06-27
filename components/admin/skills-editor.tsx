'use client';

import { useActionState, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { updateSkillsAction } from '@/lib/actions';

interface Skill {
  name: string;
  category: 'molecular' | 'analysis' | 'laboratory' | 'soft';
  level: number;
}

const CATEGORIES = ['molecular', 'analysis', 'laboratory', 'soft'] as const;

export default function SkillsEditor({ locale, skills }: { locale: string; skills: Skill[] }) {
  const [list, setList] = useState<Skill[]>(skills);
  const [state, formAction, pending] = useActionState(
    async (_prev: { success?: boolean } | null, fd: FormData) => {
      const payload = JSON.parse(fd.get('payload') as string);
      return await updateSkillsAction(locale as 'en' | 'id', payload);
    },
    null
  );

  const update = (i: number, field: keyof Skill, value: unknown) => {
    setList((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const remove = (i: number) => setList((prev) => prev.filter((_, idx) => idx !== i));

  const add = () =>
    setList((prev) => [...prev, { name: '', category: 'molecular', level: 80 }]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Manage Skills</h1>
          <p className="text-text-muted text-sm">Skills with proficiency levels</p>
        </div>
        <button type="button" onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass hover:scale-105 transition-all">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {list.map((skill, i) => (
          <div key={i} className="p-4 rounded-2xl glass flex items-center gap-3">
            <input
              type="text"
              value={skill.name}
              onChange={(e) => update(i, 'name', e.target.value)}
              placeholder="Skill name"
              className="flex-1 px-3 py-2 rounded-lg bg-bg-tertiary border border-border focus:outline-none focus:border-accent text-sm"
            />
            <select
              value={skill.category}
              onChange={(e) => update(i, 'category', e.target.value)}
              className="px-3 py-2 rounded-lg bg-bg-tertiary border border-border focus:outline-none focus:border-accent text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              max="100"
              value={skill.level}
              onChange={(e) => update(i, 'level', Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-lg bg-bg-tertiary border border-border focus:outline-none focus:border-accent text-sm text-center"
            />
            <button type="button" onClick={() => remove(i)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors" aria-label="Remove">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <input type="hidden" name="payload" value={JSON.stringify(list)} />

      {state?.success && (
        <div className="px-4 py-3 rounded-xl bg-accent-soft border border-accent text-accent text-sm">
          ✓ Skills saved successfully
        </div>
      )}

      <button type="submit" disabled={pending} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-all disabled:opacity-50">
        <Save className="w-4 h-4" />
        {pending ? 'Saving...' : 'Save All'}
      </button>
    </form>
  );
}