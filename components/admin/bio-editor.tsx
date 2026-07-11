'use client';

import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { TextArea } from '@/components/admin/ui/textarea';
import { updateBioAction } from '@/lib/actions';
import type { BioInput } from '@/lib/schemas';

export default function BioEditor({
  locale,
  enBio,
  idBio
}: {
  locale: string;
  enBio: BioInput;
  idBio: BioInput;
}) {
  return (
    <BilingualEditor<BioInput>
      title="Edit Bio"
      description="About-section text. Short is for previews; long is the full description shown on the site."
      enData={enBio}
      idData={idBio}
      onSave={async (en, id) => updateBioAction(en, id)}
      renderForm={(data, update) => (
        <div className="space-y-4">
          <TextArea
            label="Short Bio"
            value={data.short}
            onChange={(v) => update((p) => ({ ...p, short: v }))}
            rows={2}
            fullWidth
            hint="1–2 sentences. Used for previews and meta description."
          />
          <TextArea
            label="Long Bio"
            value={data.long}
            onChange={(v) => update((p) => ({ ...p, long: v }))}
            rows={6}
            fullWidth
            hint="The full About paragraph displayed on the portfolio."
          />
        </div>
      )}
    />
  );
}