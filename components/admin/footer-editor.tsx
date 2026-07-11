'use client';

import { Copy, Plus, Trash2 } from 'lucide-react';
import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { DragList } from '@/components/admin/ui/drag-list';
import { Field } from '@/components/admin/ui/field';
import { Select } from '@/components/admin/ui/select';
import { updateFooterAction } from '@/lib/actions';
import type { FooterInput } from '@/lib/schemas';

const SOCIAL_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'github', label: 'GitHub' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'website', label: 'Website' }
];

export default function FooterEditor({ locale, enFooter, idFooter }: { locale: string; enFooter: FooterInput; idFooter: FooterInput }) {
  return (
    <BilingualEditor<FooterInput>
      title="Edit Footer"
      description="Footer copyright text and social links."
      enData={enFooter}
      idData={idFooter}
      onSave={async (en, id) => updateFooterAction(en, id)}
      renderForm={(data, update, loc) => (
        <FooterForm data={data} update={update} locale={loc} />
      )}
    />
  );
}

function FooterForm({ data, update, locale }: { data: FooterInput; update: (updater: (prev: FooterInput) => FooterInput) => void; locale: 'en' | 'id' }) {
  const set = (p: Partial<FooterInput>) => update((prev) => ({ ...prev, ...p }));

  const addSocial = () =>
    set({ socials: [...(data.socials ?? []), { platform: 'LinkedIn', url: '', icon: 'linkedin' }] });

  const removeSocial = (i: number) =>
    set({ socials: (data.socials ?? []).filter((_, idx) => idx !== i) });

  const patchSocial = (i: number, p: Partial<FooterInput['socials'][number]>) => {
    const next = (data.socials ?? []).map((s, idx) => (idx === i ? { ...s, ...p } : s));
    set({ socials: next });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-3">
        <Field
          label="Copyright"
          value={data.copyright}
          onChange={(v) => set({ copyright: v })}
          fullWidth
          hint="e.g. © 2026 Rani Andriani Tunggal. All rights reserved."
        />
        <Field
          label="Tagline"
          value={data.tagline ?? ''}
          onChange={(v) => set({ tagline: v })}
          fullWidth
        />
        <Field
          label="Built With"
          value={data.builtWith ?? ''}
          onChange={(v) => set({ builtWith: v })}
          fullWidth
          hint="e.g. Built with Next.js · Hosted on Vercel"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs uppercase tracking-widest text-text-muted">Social Links</label>
          <button
            type="button"
            onClick={addSocial}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs hover:scale-105 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Social
          </button>
        </div>

        {(data.socials ?? []).length === 0 ? (
          <div className="text-center py-6 text-text-muted text-xs glass rounded-xl">No social links yet.</div>
        ) : (
          <DragList
            items={(data.socials ?? []).map((s, i) => ({ ...s, id: `social-${i}-${s.platform}` }))}
            onChange={(next) => set({ socials: next.map(({ id, ...rest }) => rest) })}
            renderItem={(social, i, handle) => (
              <div key={social.id} className="p-4 rounded-2xl glass border border-border flex items-center gap-3 flex-wrap">
                {handle}
                <Select
                  value={social.icon || ''}
                  onChange={(v) => patchSocial(i, { icon: v, platform: SOCIAL_OPTIONS.find((o) => o.value === v)?.label ?? social.platform })}
                  options={SOCIAL_OPTIONS}
                  className="w-36 text-sm"
                />
                <input
                  type="text"
                  value={social.platform}
                  onChange={(e) => patchSocial(i, { platform: e.target.value })}
                  placeholder="Display name"
                  className="w-36 px-3 py-2 rounded-lg bg-bg-tertiary border border-border focus:outline-none focus:border-accent text-sm"
                />
                <input
                  type="url"
                  value={social.url}
                  onChange={(e) => patchSocial(i, { url: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-bg-tertiary border border-border focus:outline-none focus:border-accent text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeSocial(i)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}