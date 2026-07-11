'use client';

import { Plus, Trash2 } from 'lucide-react';
import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { DragList } from '@/components/admin/ui/drag-list';
import { Select } from '@/components/admin/ui/select';
import { updateSkillsAction } from '@/lib/actions';
import type { SkillInput } from '@/lib/schemas';

const CATEGORIES = ['molecular', 'analysis', 'laboratory', 'soft'] as const;

export default function SkillsEditor({
  locale,
  enSkills,
  idSkills
}: {
  locale: string;
  enSkills: SkillInput[];
  idSkills: SkillInput[];
}) {
  return (
    <BilingualEditor<SkillInput[]>
      title="Manage Skills"
      description="Skills with proficiency levels (0–100). Drag to reorder."
      enData={enSkills}
      idData={idSkills}
      onSave={async (en, id) => updateSkillsAction(en, id)}
      renderForm={(list, update, loc) => (
        <SkillsForm list={list} update={update} locale={loc} />
      )}
    />
  );
}

function SkillsForm({
  list,
  update,
  locale
}: {
  list: SkillInput[];
  update: (updater: (prev: SkillInput[]) => SkillInput[]) => void;
  locale: 'en' | 'id';
}) {
  const add = () =>
    update((prev) => [...prev, { name: '', category: 'molecular', level: 80 }]);

  const remove = (i: number) => update((prev) => prev.filter((_, idx) => idx !== i));

  const patch = (i: number, p: Partial<SkillInput>) =>
    update((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...p } : it)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {list.length} {list.length === 1 ? 'skill' : 'skills'} ·{' '}
          <span className="uppercase tracking-wider">{locale}</span>
        </p>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs hover:scale-105 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Skill
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm glass rounded-2xl">
          No skills yet. Click "Add Skill" to get started.
        </div>
      ) : (
        <DragList
          items={list.map((s, i) => ({ ...s, id: `skill-${i}` }))}
          onChange={(next) =>
            update(() => next.map((s) => ({ name: s.name, category: s.category, level: s.level })))
          }
          renderItem={(item, i, handle) => {
            const skill = list[i];
            return (
              <div key={item.id} className="p-4 rounded-2xl glass flex items-center gap-3 flex-wrap">
                {handle}
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => patch(i, { name: e.target.value })}
                  placeholder="Skill name"
                  className="flex-1 min-w-[180px] px-3 py-2 rounded-lg bg-bg-tertiary border border-border focus:outline-none focus:border-accent text-sm"
                />
                <Select
                  value={skill.category}
                  onChange={(v) => patch(i, { category: v as SkillInput['category'] })}
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                  className="w-36 text-sm"
                />
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={skill.level}
                    onChange={(e) => patch(i, { level: Number(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-lg bg-bg-tertiary border border-border focus:outline-none focus:border-accent text-sm text-center"
                  />
                  <span className="text-xs text-text-muted">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          }}
        />
      )}
    </div>
  );
}