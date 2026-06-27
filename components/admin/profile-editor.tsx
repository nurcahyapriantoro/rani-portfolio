'use client';

import { useActionState, useState } from 'react';
import { Save } from 'lucide-react';
import { updateProfileAction } from '@/lib/actions';

interface Profile {
  fullName: string;
  nickname: string;
  pronouns: string;
  title: string;
  subtitle: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
  github: string;
  instagram: string;
  cvUrl: string;
  avatarInitials: string;
  avatarColor: string;
}

export default function ProfileEditor({ locale, profile }: { locale: string; profile: Profile }) {
  const [data, setData] = useState<Profile>(profile);
  const [state, formAction, pending] = useActionState(
    async (_prev: { success?: boolean; error?: string } | null, fd: FormData) => {
      const payload = JSON.parse(fd.get('payload') as string);
      return await updateProfileAction(locale as 'en' | 'id', payload);
    },
    null
  );

  const handleChange = (field: keyof Profile, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-text-muted text-sm">
          Update your personal information and contact details
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Full Name" value={data.fullName} onChange={(v) => handleChange('fullName', v)} />
        <Field label="Nickname" value={data.nickname} onChange={(v) => handleChange('nickname', v)} />
        <Field label="Pronouns" value={data.pronouns} onChange={(v) => handleChange('pronouns', v)} />
        <Field label="Avatar Initials" value={data.avatarInitials} onChange={(v) => handleChange('avatarInitials', v)} maxLength={3} />
        <Field label="Title" value={data.title} onChange={(v) => handleChange('title', v)} fullWidth />
        <Field label="Subtitle" value={data.subtitle} onChange={(v) => handleChange('subtitle', v)} fullWidth />
        <Field label="Tagline" value={data.tagline} onChange={(v) => handleChange('tagline', v)} fullWidth />
        <Field label="Location" value={data.location} onChange={(v) => handleChange('location', v)} />
        <Field label="Email" value={data.email} onChange={(v) => handleChange('email', v)} type="email" />
        <Field label="Phone" value={data.phone} onChange={(v) => handleChange('phone', v)} />
        <Field label="WhatsApp Number (with country code, no +)" value={data.whatsapp} onChange={(v) => handleChange('whatsapp', v)} />
        <Field label="LinkedIn URL" value={data.linkedin} onChange={(v) => handleChange('linkedin', v)} />
        <Field label="GitHub URL" value={data.github} onChange={(v) => handleChange('github', v)} />
        <Field label="Instagram URL" value={data.instagram} onChange={(v) => handleChange('instagram', v)} />
        <Field label="CV File Path" value={data.cvUrl} onChange={(v) => handleChange('cvUrl', v)} />
      </div>

      <input type="hidden" name="payload" value={JSON.stringify(data)} />

      {state?.success && (
        <div className="px-4 py-3 rounded-xl bg-accent-soft border border-accent text-accent text-sm">
          ✓ Profile saved successfully
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-all disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {pending ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  fullWidth = false,
  maxLength
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  fullWidth?: boolean;
  maxLength?: number;
}) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all"
      />
    </div>
  );
}