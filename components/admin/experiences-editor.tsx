'use client';

import { useState } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { DragList } from '@/components/admin/ui/drag-list';
import { Field } from '@/components/admin/ui/field';
import { TextArea } from '@/components/admin/ui/textarea';
import { TagInput } from '@/components/admin/ui/tag-input';
import { ImageListPicker } from '@/components/admin/ui/image-list-picker';
import { updateExperiencesAction } from '@/lib/actions';
import type { ExperienceInput } from '@/lib/schemas';

export default function ExperiencesEditor({
  locale,
  enExperiences,
  idExperiences
}: {
  locale: string;
  enExperiences: ExperienceInput[];
  idExperiences: ExperienceInput[];
}) {
  return (
    <BilingualEditor<ExperienceInput[]>
      title="Manage Experiences"
      description="Add, edit, reorder, or remove work experiences. Drag handles or arrow buttons to reorder."
      enData={enExperiences}
      idData={idExperiences}
      onSave={async (en, id) => updateExperiencesAction(en, id)}
      renderForm={(list, update, loc) => (
        <ExperiencesForm list={list} update={update} locale={loc} />
      )}
    />
  );
}

function ExperiencesForm({
  list,
  update,
  locale
}: {
  list: ExperienceInput[];
  update: (updater: (prev: ExperienceInput[]) => ExperienceInput[]) => void;
  locale: 'en' | 'id';
}) {
  const add = () => {
    update((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        role: '',
        company: '',
        type: '',
        period: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        duration: '',
        location: '',
        description: '',
        skills: [],
        achievements: [],
        companyUrl: '',
        images: []
      }
    ]);
  };

  const duplicate = (i: number) => {
    update((prev) => {
      const copy = { ...prev[i], id: `exp-${Date.now()}` };
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next;
    });
  };

  const remove = (i: number) => update((prev) => prev.filter((_, idx) => idx !== i));

  const patch = (i: number, patchObj: Partial<ExperienceInput>) =>
    update((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patchObj } : it)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {list.length} {list.length === 1 ? 'experience' : 'experiences'} ·{' '}
          <span className="uppercase tracking-wider">{locale}</span>
        </p>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs hover:scale-105 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Experience
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm glass rounded-2xl">
          No experiences yet. Click "Add Experience" to get started.
        </div>
      ) : (
        <DragList
          items={list}
          onChange={(next) => update(() => next)}
          renderItem={(exp, i, handle) => (
            <ExperienceCard
              key={exp.id}
              exp={exp}
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

function ExperienceCard({
  exp,
  index,
  handle,
  onPatch,
  onDuplicate,
  onRemove
}: {
  exp: ExperienceInput;
  index: number;
  handle: React.ReactNode;
  onPatch: (p: Partial<ExperienceInput>) => void;
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
            {open ? '▾' : '▸'} Experience #{index + 1}
            {exp.role && <span className="ml-2 normal-case tracking-normal">· {exp.role}</span>}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded-lg text-text-muted hover:bg-bg-tertiary hover:text-accent transition-colors"
            aria-label="Duplicate"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
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
              label="Role"
              value={exp.role}
              onChange={(v) => onPatch({ role: v })}
              required
              fullWidth
            />
            <Field
              label="Company"
              value={exp.company}
              onChange={(v) => onPatch({ company: v })}
              required
            />
            <Field
              label="Company URL (optional)"
              value={exp.companyUrl ?? ''}
              onChange={(v) => onPatch({ companyUrl: v })}
              type="url"
              placeholder="https://..."
            />
            <Field
              label="Type"
              value={exp.type}
              onChange={(v) => onPatch({ type: v })}
              placeholder="Contract / Internship / etc"
            />
            <Field
              label="Period (display)"
              value={exp.period}
              onChange={(v) => onPatch({ period: v })}
              placeholder="Jan 2024 - Dec 2024"
            />
            <Field
              label="Duration"
              value={exp.duration}
              onChange={(v) => onPatch({ duration: v })}
              placeholder="1 yr"
            />
            <Field
              label="Start Date"
              value={exp.startDate ?? ''}
              onChange={(v) => onPatch({ startDate: v })}
              type="month"
            />
            <Field
              label="End Date"
              value={exp.isCurrent ? '' : (exp.endDate ?? '')}
              onChange={(v) => onPatch({ endDate: v })}
              type="month"
              hint={exp.isCurrent ? 'Disabled: currently ongoing' : ''}
            />
            <Field
              label="Location"
              value={exp.location}
              onChange={(v) => onPatch({ location: v })}
              fullWidth
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={exp.isCurrent}
              onChange={(e) => onPatch({ isCurrent: e.target.checked })}
              className="w-4 h-4 accent-accent"
            />
            <span>I currently work here</span>
          </label>

          <TextArea
            label="Description"
            value={exp.description}
            onChange={(v) => onPatch({ description: v })}
            rows={3}
            fullWidth
          />

          <TagInput
            label="Skills (press Enter to add)"
            values={exp.skills}
            onChange={(v) => onPatch({ skills: v })}
            fullWidth
          />

          <TagInput
            label="Achievements / Highlights (press Enter to add)"
            values={exp.achievements ?? []}
            onChange={(v) => onPatch({ achievements: v })}
            placeholder="e.g. Increased lab efficiency by 30%"
            fullWidth
            hint="These appear as bullet points under the description"
          />

          <ImageListPicker
            label="Images"
            values={exp.images ?? []}
            onChange={(v) => onPatch({ images: v })}
            section="experiences"
            hint="Upload images or paste URLs. Drag to reorder."
          />
        </div>
      )}
    </div>
  );
}