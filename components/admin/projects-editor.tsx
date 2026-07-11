'use client';

import { Copy, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { DragList } from '@/components/admin/ui/drag-list';
import { Field } from '@/components/admin/ui/field';
import { TextArea } from '@/components/admin/ui/textarea';
import { TagInput } from '@/components/admin/ui/tag-input';
import { ImageListPicker } from '@/components/admin/ui/image-list-picker';
import { updateProjectsAction } from '@/lib/actions';
import type { ProjectInput } from '@/lib/schemas';

const EMPTY_PROJECT: Omit<ProjectInput, 'id'> = {
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  impact: '',
  impactLabel: 'Impact',
  team: '',
  publishedAt: '',
  venue: '',
  url: '',
  tags: []
};

export default function ProjectsEditor({ locale, enProjects, idProjects }: { locale: string; enProjects: ProjectInput[]; idProjects: ProjectInput[] }) {
  return (
    <BilingualEditor<ProjectInput[]>
      title="Manage Projects"
      description="Featured projects shown in the Projects section. Drag to reorder."
      enData={enProjects}
      idData={idProjects}
      onSave={async (en, id) => updateProjectsAction(en, id)}
      renderForm={(list, update, loc) => <ProjectsForm list={list} update={update} locale={loc} />}
    />
  );
}

function ProjectsForm({ list, update, locale }: { list: ProjectInput[]; update: (updater: (prev: ProjectInput[]) => ProjectInput[]) => void; locale: 'en' | 'id' }) {
  const add = () => update((prev) => [...prev, { id: `proj-${Date.now()}`, ...EMPTY_PROJECT }]);
  const duplicate = (i: number) =>
    update((prev) => {
      const copy = { ...prev[i], id: `proj-${Date.now()}` };
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next;
    });
  const remove = (i: number) => update((prev) => prev.filter((_, idx) => idx !== i));
  const patch = (i: number, p: Partial<ProjectInput>) =>
    update((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...p } : it)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {list.length} {list.length === 1 ? 'project' : 'projects'} ·{' '}
          <span className="uppercase tracking-wider">{locale}</span>
        </p>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs hover:scale-105 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Project
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm glass rounded-2xl">
          No projects yet.
        </div>
      ) : (
        <DragList
          items={list}
          onChange={(next) => update(() => next)}
          renderItem={(proj, i, handle) => (
            <ProjectCard key={proj.id} proj={proj} index={i} handle={handle} onPatch={(p) => patch(i, p)} onDuplicate={() => duplicate(i)} onRemove={() => remove(i)} />
          )}
        />
      )}
    </div>
  );
}

function ProjectCard({ proj, index, handle, onPatch, onDuplicate, onRemove }: { proj: ProjectInput; index: number; handle: React.ReactNode; onPatch: (p: Partial<ProjectInput>) => void; onDuplicate: () => void; onRemove: () => void }) {
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
            {open ? '▾' : '▸'} Project #{index + 1}
            {proj.title && <span className="ml-2 normal-case tracking-normal">· {proj.title}</span>}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onDuplicate} className="p-1.5 rounded-lg text-text-muted hover:bg-bg-tertiary hover:text-accent" aria-label="Duplicate" title="Duplicate">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onRemove} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10" aria-label="Remove">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-4">
          <Field label="Title" value={proj.title} onChange={(v) => onPatch({ title: v })} fullWidth required />
          <Field label="Subtitle" value={proj.subtitle ?? ''} onChange={(v) => onPatch({ subtitle: v })} fullWidth />
          <TextArea label="Description" value={proj.description} onChange={(v) => onPatch({ description: v })} rows={3} fullWidth />
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="Impact Number" value={proj.impact ?? ''} onChange={(v) => onPatch({ impact: v })} placeholder="80%" />
            <Field label="Impact Label" value={proj.impactLabel ?? ''} onChange={(v) => onPatch({ impactLabel: v })} placeholder="Improvement" />
            <Field label="Team" value={proj.team ?? ''} onChange={(v) => onPatch({ team: v })} placeholder="6 researchers from IPB" />
            <Field label="Venue" value={proj.venue ?? ''} onChange={(v) => onPatch({ venue: v })} placeholder="AGROKREATIF Journal" />
            <Field label="Published At" value={proj.publishedAt ?? ''} onChange={(v) => onPatch({ publishedAt: v })} placeholder="Jun 2025" />
            <Field label="URL" value={proj.url ?? ''} onChange={(v) => onPatch({ url: v })} type="url" placeholder="https://..." />
          </div>
          <ImageListPicker label="Cover Image" values={proj.imageUrl ? [proj.imageUrl] : []} onChange={(v) => onPatch({ imageUrl: v[0] ?? '' })} section="projects" hint="Single cover image (or paste a URL below)" />
          <Field label="Image URL (if not uploaded above)" value={proj.imageUrl ?? ''} onChange={(v) => onPatch({ imageUrl: v })} placeholder="/project-pilot.jpg" />
          <TagInput label="Tags" values={proj.tags ?? []} onChange={(v) => onPatch({ tags: v })} fullWidth />
        </div>
      )}
    </div>
  );
}