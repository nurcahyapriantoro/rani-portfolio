'use client';

import { Copy, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { DragList } from '@/components/admin/ui/drag-list';
import { Field } from '@/components/admin/ui/field';
import { TextArea } from '@/components/admin/ui/textarea';
import { updateVolunteeringAction } from '@/lib/actions';
import type { VolunteeringInput } from '@/lib/schemas';

export default function VolunteeringEditor({ locale, enVolunteering, idVolunteering }: { locale: string; enVolunteering: VolunteeringInput[]; idVolunteering: VolunteeringInput[] }) {
  return (
    <BilingualEditor<VolunteeringInput[]>
      title="Manage Volunteering"
      description="Community service and volunteer work. Drag to reorder."
      enData={enVolunteering}
      idData={idVolunteering}
      onSave={async (en, id) => updateVolunteeringAction(en, id)}
      renderForm={(list, update, loc) => <VolForm list={list} update={update} locale={loc} />}
    />
  );
}

function VolForm({ list, update, locale }: { list: VolunteeringInput[]; update: (updater: (prev: VolunteeringInput[]) => VolunteeringInput[]) => void; locale: 'en' | 'id' }) {
  const add = () =>
    update((prev) => [
      ...prev,
      { id: `vol-${Date.now()}`, role: '', organization: '', period: '', duration: '', category: '', description: '', location: '' }
    ]);
  const duplicate = (i: number) =>
    update((prev) => {
      const copy = { ...prev[i], id: `vol-${Date.now()}` };
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next;
    });
  const remove = (i: number) => update((prev) => prev.filter((_, idx) => idx !== i));
  const patch = (i: number, p: Partial<VolunteeringInput>) =>
    update((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...p } : it)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {list.length} {list.length === 1 ? 'entry' : 'entries'} ·{' '}
          <span className="uppercase tracking-wider">{locale}</span>
        </p>
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs hover:scale-105 transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Entry
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm glass rounded-2xl">No volunteering entries yet.</div>
      ) : (
        <DragList
          items={list}
          onChange={(next) => update(() => next)}
          renderItem={(vol, i, handle) => (
            <VolCard key={vol.id} vol={vol} index={i} handle={handle} onPatch={(p) => patch(i, p)} onDuplicate={() => duplicate(i)} onRemove={() => remove(i)} />
          )}
        />
      )}
    </div>
  );
}

function VolCard({ vol, index, handle, onPatch, onDuplicate, onRemove }: { vol: VolunteeringInput; index: number; handle: React.ReactNode; onPatch: (p: Partial<VolunteeringInput>) => void; onDuplicate: () => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-5 rounded-2xl glass border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {handle}
          <button type="button" onClick={() => setOpen(!open)} className="text-xs font-mono uppercase tracking-widest text-text-muted hover:text-accent">
            {open ? '▾' : '▸'} Volunteering #{index + 1}
            {vol.role && <span className="ml-2 normal-case tracking-normal">· {vol.role}</span>}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onDuplicate} className="p-1.5 rounded-lg text-text-muted hover:bg-bg-tertiary hover:text-accent" aria-label="Duplicate">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onRemove} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10" aria-label="Remove">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Role" value={vol.role} onChange={(v) => onPatch({ role: v })} required />
            <Field label="Organization" value={vol.organization} onChange={(v) => onPatch({ organization: v })} required />
            <Field label="Period" value={vol.period} onChange={(v) => onPatch({ period: v })} placeholder="May 2023" />
            <Field label="Duration" value={vol.duration} onChange={(v) => onPatch({ duration: v })} placeholder="1 mo" />
            <Field label="Category" value={vol.category} onChange={(v) => onPatch({ category: v })} placeholder="Social Services" />
            <Field label="Location" value={vol.location ?? ''} onChange={(v) => onPatch({ location: v })} />
          </div>
          <TextArea label="Description" value={vol.description ?? ''} onChange={(v) => onPatch({ description: v })} rows={2} fullWidth />
        </div>
      )}
    </div>
  );
}