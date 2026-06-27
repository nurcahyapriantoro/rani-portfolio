'use client';

import { useActionState, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { updateExperiencesAction } from '@/lib/actions';

interface Experience {
  id: string;
  role: string;
  company: string;
  type: string;
  period: string;
  duration: string;
  location: string;
  description: string;
  skills: string[];
}

export default function ExperiencesEditor({ locale, experiences }: { locale: string; experiences: Experience[] }) {
  const [list, setList] = useState<Experience[]>(experiences);
  const [state, formAction, pending] = useActionState(
    async (_prev: { success?: boolean } | null, fd: FormData) => {
      const payload = JSON.parse(fd.get('payload') as string);
      return await updateExperiencesAction(locale as 'en' | 'id', payload);
    },
    null
  );

  const update = (i: number, field: keyof Experience, value: unknown) => {
    setList((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const remove = (i: number) => {
    setList((prev) => prev.filter((_, idx) => idx !== i));
  };

  const add = () => {
    setList((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        role: '',
        company: '',
        type: '',
        period: '',
        duration: '',
        location: '',
        description: '',
        skills: []
      }
    ]);
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Manage Experiences</h1>
          <p className="text-text-muted text-sm">Add, edit, or remove work experiences</p>
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <div className="space-y-4">
        {list.map((exp, i) => (
          <div key={exp.id} className="p-6 rounded-2xl glass space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
                Experience #{i + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                aria-label="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <Input label="Role" value={exp.role} onChange={(v) => update(i, 'role', v)} />
              <Input label="Company" value={exp.company} onChange={(v) => update(i, 'company', v)} />
              <Input label="Type" value={exp.type} onChange={(v) => update(i, 'type', v)} placeholder="Contract / Internship / etc" />
              <Input label="Period" value={exp.period} onChange={(v) => update(i, 'period', v)} placeholder="Jan 2024 - Dec 2024" />
              <Input label="Duration" value={exp.duration} onChange={(v) => update(i, 'duration', v)} placeholder="1 yr" />
              <Input label="Location" value={exp.location} onChange={(v) => update(i, 'location', v)} />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Description</label>
              <textarea
                value={exp.description}
                onChange={(e) => update(i, 'description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={exp.skills.join(', ')}
                onChange={(e) => update(i, 'skills', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all"
              />
            </div>
          </div>
        ))}
      </div>

      <input type="hidden" name="payload" value={JSON.stringify(list)} />

      {state?.success && (
        <div className="px-4 py-3 rounded-xl bg-accent-soft border border-accent text-accent text-sm">
          ✓ Experiences saved successfully
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-all disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {pending ? 'Saving...' : 'Save All'}
      </button>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all"
      />
    </div>
  );
}