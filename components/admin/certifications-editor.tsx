'use client';

import { Copy, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { DragList } from '@/components/admin/ui/drag-list';
import { Field } from '@/components/admin/ui/field';
import { TextArea } from '@/components/admin/ui/textarea';
import { updateCertificationsAction } from '@/lib/actions';
import type { CertificationInput } from '@/lib/schemas';

export default function CertificationsEditor({ locale, enCertifications, idCertifications }: { locale: string; enCertifications: CertificationInput[]; idCertifications: CertificationInput[] }) {
  return (
    <BilingualEditor<CertificationInput[]>
      title="Manage Certifications"
      description="Professional certifications and credentials. Drag to reorder."
      enData={enCertifications}
      idData={idCertifications}
      onSave={async (en, id) => updateCertificationsAction(en, id)}
      renderForm={(list, update, loc) => <CertsForm list={list} update={update} locale={loc} />}
    />
  );
}

function CertsForm({ list, update, locale }: { list: CertificationInput[]; update: (updater: (prev: CertificationInput[]) => CertificationInput[]) => void; locale: 'en' | 'id' }) {
  const add = () =>
    update((prev) => [
      ...prev,
      { id: `cert-${Date.now()}`, title: '', issuer: '', date: '', url: '', credentialId: '', description: '' }
    ]);
  const duplicate = (i: number) =>
    update((prev) => {
      const copy = { ...prev[i], id: `cert-${Date.now()}` };
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next;
    });
  const remove = (i: number) => update((prev) => prev.filter((_, idx) => idx !== i));
  const patch = (i: number, p: Partial<CertificationInput>) =>
    update((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...p } : it)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {list.length} {list.length === 1 ? 'certification' : 'certifications'} ·{' '}
          <span className="uppercase tracking-wider">{locale}</span>
        </p>
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs hover:scale-105 transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Certification
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm glass rounded-2xl">No certifications yet.</div>
      ) : (
        <DragList
          items={list}
          onChange={(next) => update(() => next)}
          renderItem={(cert, i, handle) => (
            <CertCard key={cert.id} cert={cert} index={i} handle={handle} onPatch={(p) => patch(i, p)} onDuplicate={() => duplicate(i)} onRemove={() => remove(i)} />
          )}
        />
      )}
    </div>
  );
}

function CertCard({ cert, index, handle, onPatch, onDuplicate, onRemove }: { cert: CertificationInput; index: number; handle: React.ReactNode; onPatch: (p: Partial<CertificationInput>) => void; onDuplicate: () => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-5 rounded-2xl glass border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {handle}
          <button type="button" onClick={() => setOpen(!open)} className="text-xs font-mono uppercase tracking-widest text-text-muted hover:text-accent">
            {open ? '▾' : '▸'} Certification #{index + 1}
            {cert.title && <span className="ml-2 normal-case tracking-normal">· {cert.title}</span>}
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
          <Field label="Title" value={cert.title} onChange={(v) => onPatch({ title: v })} required fullWidth />
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Issuer" value={cert.issuer} onChange={(v) => onPatch({ issuer: v })} />
            <Field label="Date" value={cert.date} onChange={(v) => onPatch({ date: v })} placeholder="Aug 2022" />
            <Field label="Credential ID" value={cert.credentialId ?? ''} onChange={(v) => onPatch({ credentialId: v })} />
            <Field label="Credential URL" value={cert.url ?? ''} onChange={(v) => onPatch({ url: v })} type="url" placeholder="https://..." />
          </div>
          <TextArea label="Description" value={cert.description ?? ''} onChange={(v) => onPatch({ description: v })} rows={2} fullWidth />
        </div>
      )}
    </div>
  );
}