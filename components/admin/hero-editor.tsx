'use client';

import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { Field } from '@/components/admin/ui/field';
import { updateHeroAction } from '@/lib/actions';
import type { HeroInput } from '@/lib/schemas';

export default function HeroEditor({ locale, enHero }: { locale: string; enHero: HeroInput }) {
  return (
    <BilingualEditor<HeroInput>
      title="Edit Hero"
      description="Strings shown in the landing hero section (above the profile editor's name/title)."
      enData={enHero}
      onSave={(data) => updateHeroAction(data)}
      renderForm={(data, update) => (
        <div className="space-y-4 max-w-xl">
          <Field
            label="Greeting (e.g. 'Hello, I'm')"
            value={data.greeting}
            onChange={(v) => update((p) => ({ ...p, greeting: v }))}
            fullWidth
          />
        </div>
      )}
    />
  );
}