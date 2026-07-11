'use client';

import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { Field } from '@/components/admin/ui/field';
import { updateHeroAction } from '@/lib/actions';
import type { HeroInput } from '@/lib/schemas';

export default function HeroEditor({ locale, enHero, idHero }: { locale: string; enHero: HeroInput; idHero: HeroInput }) {
  return (
    <BilingualEditor<HeroInput>
      title="Edit Hero"
      description="Strings shown in the landing hero section (above the profile editor's name/title)."
      enData={enHero}
      idData={idHero}
      onSave={async (en, id) => updateHeroAction(en, id)}
      renderForm={(data, update) => (
        <div className="space-y-4 max-w-xl">
          <Field
            label="Greeting (e.g. 'Hello, I'm' / 'Halo, saya')"
            value={data.greeting}
            onChange={(v) => update((p) => ({ ...p, greeting: v }))}
            fullWidth
          />
          <Field
            label="Scroll Label (small text under arrow)"
            value={data.scrollLabel}
            onChange={(v) => update((p) => ({ ...p, scrollLabel: v }))}
            fullWidth
          />
        </div>
      )}
    />
  );
}