'use client';

import { Copy, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { DragList } from '@/components/admin/ui/drag-list';
import { Field } from '@/components/admin/ui/field';
import { updateAwardsAction } from '@/lib/actions';
import type { AwardInput } from '@/lib/schemas';

export default function AwardsEditor({
  locale,
  enAwards,
  idAwards
}: {
  locale: string;
  enAwards: AwardInput[];
  idAwards: AwardInput[];
}) {
  return (
    <BilingualEditor<AwardInput[]>
      title="Manage Awards"
      description="Honors and recognitions. Drag to reorder."
      enData={enAwards}
      idData={idAwards}
      onSave={async (en, id) => updateAwardsAction(en, id)}
      renderForm={(list, update, loc) => <AwardsForm list={list} update={update} locale={loc} />}
    />
  );
}

function AwardsForm({
  list,
  update,
  locale
}: {
  list: AwardInput[];
  update: (updater: (prev: AwardInput[]) => AwardInput[]) => void;
  locale: 'en' | 'id';
}) {
  const add = () =>
    update((prev) => [
      ...prev,
      {
        id: `award-${Date.now()}`,
        rank: '',
        title: '',
        issuer: '',
        date: '',
        associatedWith: ''
      }
    ]);

  const duplicate = (i: number) =>
    update((prev) => {
      const copy = { ...prev[i], id: `award-${Date.now()}` };
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next;
    });

  const remove = (i: number) => update((prev) => prev.filter((_, idx) => idx !== i));

  const patch = (i: number, p: Partial<AwardInput>) =>
    update((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...p } : it)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {list.length} {list.length === 1 ? 'award' : 'awards'} ·{' '}
          <span className="uppercase tracking-wider">{locale}</span>
        </p>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs hover:scale-105 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Award
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm glass rounded-2xl">
          No awards yet.
        </div>
      ) : (
        <DragList
          items={list}
          onChange={(next) => update(() => next)}
          renderItem={(award, i, handle) => (
            <AwardCard
              key={award.id}
              award={award}
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

function AwardCard({
  award,
  index,
  handle,
  onPatch,
  onDuplicate,
  onRemove
}: {
  award: AwardInput;
  index: number;
  handle: React.ReactNode;
  onPatch: (p: Partial<AwardInput>) => void;
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
            {open ? '▾' : '▸'} Award #{index + 1}
            {award.title && <span className="ml-2 normal-case tracking-normal">· {award.title}</span>}
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
        <div className="space-y-3">
          <Field
            label="Rank"
            value={award.rank}
            onChange={(v) => onPatch({ rank: v })}
            placeholder="1st Place / Finalist / etc"
          />
          <Field label="Title" value={award.title} onChange={(v) => onPatch({ title: v })} />
          <Field label="Issuer" value={award.issuer} onChange={(v) => onPatch({ issuer: v })} />
          <Field label="Date" value={award.date} onChange={(v) => onPatch({ date: v })} placeholder="2025" />
          <Field label="Associated With" value={award.associatedWith} onChange={(v) => onPatch({ associatedWith: v })} />
        </div>
      )}
    </div>
  );
}