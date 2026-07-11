'use client';

import { Copy, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { DragList } from '@/components/admin/ui/drag-list';
import { Field } from '@/components/admin/ui/field';
import { TextArea } from '@/components/admin/ui/textarea';
import { TagInput } from '@/components/admin/ui/tag-input';
import { ImageListPicker } from '@/components/admin/ui/image-list-picker';
import { updateEducationsAction } from '@/lib/actions';
import type { EducationInput } from '@/lib/schemas';

export default function EducationEditor({
  locale,
  enEducations,
  idEducations
}: {
  locale: string;
  enEducations: EducationInput[];
  idEducations: EducationInput[];
}) {
  return (
    <BilingualEditor<EducationInput[]>
      title="Manage Education"
      description="Schools, degrees, and academic achievements. Drag to reorder."
      enData={enEducations}
      idData={idEducations}
      onSave={async (en, id) => updateEducationsAction(en, id)}
      renderForm={(list, update, loc) => (
        <EducationForm list={list} update={update} locale={loc} />
      )}
    />
  );
}

function EducationForm({
  list,
  update,
  locale
}: {
  list: EducationInput[];
  update: (updater: (prev: EducationInput[]) => EducationInput[]) => void;
  locale: 'en' | 'id';
}) {
  const add = () =>
    update((prev) => [
      ...prev,
      {
        id: `edu-${Date.now()}`,
        school: '',
        degree: '',
        field: '',
        period: '',
        startYear: '',
        endYear: '',
        location: '',
        description: '',
        achievements: [],
        logoUrl: '',
        gpa: ''
      }
    ]);

  const duplicate = (i: number) =>
    update((prev) => {
      const copy = { ...prev[i], id: `edu-${Date.now()}` };
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next;
    });

  const remove = (i: number) => update((prev) => prev.filter((_, idx) => idx !== i));

  const patch = (i: number, p: Partial<EducationInput>) =>
    update((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...p } : it)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {list.length} {list.length === 1 ? 'school' : 'schools'} ·{' '}
          <span className="uppercase tracking-wider">{locale}</span>
        </p>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs hover:scale-105 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add School
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm glass rounded-2xl">
          No education entries yet.
        </div>
      ) : (
        <DragList
          items={list}
          onChange={(next) => update(() => next)}
          renderItem={(edu, i, handle) => (
            <EducationCard
              key={edu.id}
              edu={edu}
              index={i}
              handle={handle}
              onPatch={(p) => patch(i, p)}
              onDuplicate={() => duplicate(i)}
              onRemove={() => remove(i)}
            />
          )}
        />
      )}
    </div>
  );
}

function EducationCard({
  edu,
  index,
  handle,
  onPatch,
  onDuplicate,
  onRemove
}: {
  edu: EducationInput;
  index: number;
  handle: React.ReactNode;
  onPatch: (p: Partial<EducationInput>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-5 rounded-2xl glass border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {handle}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-xs font-mono uppercase tracking-widest text-text-muted hover:text-accent"
          >
            {open ? '▾' : '▸'} School #{index + 1}
            {edu.school && <span className="ml-2 normal-case tracking-normal">· {edu.school}</span>}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded-lg text-text-muted hover:bg-bg-tertiary hover:text-accent"
            aria-label="Duplicate"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
            aria-label="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Field
              label="School"
              value={edu.school}
              onChange={(v) => onPatch({ school: v })}
              required
            />
            <Field
              label="Degree"
              value={edu.degree}
              onChange={(v) => onPatch({ degree: v })}
              required
            />
            <Field
              label="Field of Study"
              value={edu.field ?? ''}
              onChange={(v) => onPatch({ field: v })}
            />
            <Field label="Location" value={edu.location} onChange={(v) => onPatch({ location: v })} />
            <Field
              label="Period (display)"
              value={edu.period}
              onChange={(v) => onPatch({ period: v })}
              placeholder="2022 – 2026"
            />
            <Field
              label="Start Year"
              value={edu.startYear ?? ''}
              onChange={(v) => onPatch({ startYear: v })}
              placeholder="2022"
            />
            <Field
              label="End Year (or expected)"
              value={edu.endYear ?? ''}
              onChange={(v) => onPatch({ endYear: v })}
              placeholder="2026"
            />
            <Field
              label="GPA"
              value={edu.gpa ?? ''}
              onChange={(v) => onPatch({ gpa: v })}
              placeholder="3.77 / 4.00"
            />
            <Field
              label="Logo URL"
              value={edu.logoUrl ?? ''}
              onChange={(v) => onPatch({ logoUrl: v })}
              placeholder="/uploads/education/ipb-logo.png"
              fullWidth
            />
          </div>

          <TextArea
            label="Description"
            value={edu.description ?? ''}
            onChange={(v) => onPatch({ description: v })}
            rows={2}
            fullWidth
          />

          <TagInput
            label="Achievements / Honors"
            values={edu.achievements ?? []}
            onChange={(v) => onPatch({ achievements: v })}
            fullWidth
            placeholder="e.g. Cumlaude track"
          />
        </div>
      )}
    </div>
  );
}