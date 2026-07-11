'use client';

import { Copy, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { DragList } from '@/components/admin/ui/drag-list';
import { Field } from '@/components/admin/ui/field';
import { TextArea } from '@/components/admin/ui/textarea';
import { TagInput } from '@/components/admin/ui/tag-input';
import { updatePublicationsAction } from '@/lib/actions';
import type { PublicationInput } from '@/lib/schemas';

export default function PublicationsEditor({
  locale,
  enPublications,
  idPublications
}: {
  locale: string;
  enPublications: PublicationInput[];
  idPublications: PublicationInput[];
}) {
  return (
    <BilingualEditor<PublicationInput[]>
      title="Manage Publications"
      description="Research papers and journal articles. Drag to reorder."
      enData={enPublications}
      idData={idPublications}
      onSave={async (en, id) => updatePublicationsAction(en, id)}
      renderForm={(list, update, loc) => (
        <PublicationsForm list={list} update={update} locale={loc} />
      )}
    />
  );
}

function PublicationsForm({
  list,
  update,
  locale
}: {
  list: PublicationInput[];
  update: (updater: (prev: PublicationInput[]) => PublicationInput[]) => void;
  locale: 'en' | 'id';
}) {
  const add = () =>
    update((prev) => [
      ...prev,
      {
        id: `pub-${Date.now()}`,
        title: '',
        authors: [],
        venue: '',
        date: '',
        type: 'journal',
        abstract: '',
        url: '',
        tags: []
      }
    ]);

  const duplicate = (i: number) =>
    update((prev) => {
      const copy = { ...prev[i], id: `pub-${Date.now()}` };
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next;
    });

  const remove = (i: number) => update((prev) => prev.filter((_, idx) => idx !== i));

  const patch = (i: number, p: Partial<PublicationInput>) =>
    update((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...p } : it)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {list.length} {list.length === 1 ? 'publication' : 'publications'} ·{' '}
          <span className="uppercase tracking-wider">{locale}</span>
        </p>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs hover:scale-105 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Publication
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm glass rounded-2xl">
          No publications yet.
        </div>
      ) : (
        <DragList
          items={list}
          onChange={(next) => update(() => next)}
          renderItem={(pub, i, handle) => (
            <PublicationCard
              key={pub.id}
              pub={pub}
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

function PublicationCard({
  pub,
  index,
  handle,
  onPatch,
  onDuplicate,
  onRemove
}: {
  pub: PublicationInput;
  index: number;
  handle: React.ReactNode;
  onPatch: (p: Partial<PublicationInput>) => void;
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
            {open ? '▾' : '▸'} Publication #{index + 1}
            {pub.title && <span className="ml-2 normal-case tracking-normal line-clamp-1">· {pub.title}</span>}
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
          <Field
            label="Title"
            value={pub.title}
            onChange={(v) => onPatch({ title: v })}
            fullWidth
            required
          />
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="Venue" value={pub.venue} onChange={(v) => onPatch({ venue: v })} />
            <Field label="Date" value={pub.date} onChange={(v) => onPatch({ date: v })} />
            <Field label="Type" value={pub.type} onChange={(v) => onPatch({ type: v })} placeholder="journal / conference" />
          </div>
          <TagInput
            label="Authors (press Enter)"
            values={pub.authors}
            onChange={(v) => onPatch({ authors: v })}
            fullWidth
          />
          <TagInput
            label="Tags (press Enter)"
            values={pub.tags ?? []}
            onChange={(v) => onPatch({ tags: v })}
            fullWidth
          />
          <Field
            label="URL"
            value={pub.url}
            onChange={(v) => onPatch({ url: v })}
            type="url"
            fullWidth
            placeholder="https://..."
          />
          <TextArea
            label="Abstract"
            value={pub.abstract}
            onChange={(v) => onPatch({ abstract: v })}
            rows={4}
            fullWidth
          />
        </div>
      )}
    </div>
  );
}