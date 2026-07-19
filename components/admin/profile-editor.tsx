'use client';

import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { Field } from '@/components/admin/ui/field';
import { updateProfileAction } from '@/lib/actions';
import type { ProfileInput } from '@/lib/schemas';

export default function ProfileEditor({
  locale,
  enProfile,
  idProfile
}: {
  locale: string;
  enProfile: ProfileInput;
  idProfile: ProfileInput;
}) {
  return (
    <BilingualEditor<ProfileInput>
      title="Edit Profile"
      description="Personal information shown across the portfolio. Switch tabs to manage EN/ID translations, then save both at once."
      enData={enProfile}
      idData={idProfile}
      onSave={async (en, id) => updateProfileAction(en, id)}
      renderForm={(data, update, loc) => (
        <ProfileForm data={data} update={update} locale={loc} />
      )}
    />
  );
}

function ProfileForm({
  data,
  update,
  locale
}: {
  data: ProfileInput;
  update: (updater: (prev: ProfileInput) => ProfileInput) => void;
  locale: 'en' | 'id';
}) {
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);

  const set = <K extends keyof ProfileInput>(field: K, value: ProfileInput[K]) =>
    update((prev) => ({ ...prev, [field]: value }));

  const uploadPhoto = async (file: File) => {
    setPhotoError(null);
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      fd.append('section', 'profile');
      fd.append('hint', file.name);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        setPhotoError(result.error ?? 'Upload failed');
        return;
      }
      const url = result.files[0].url as string;
      set('photoUrl', url);
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  const uploadCv = async (file: File) => {
    setCvError(null);
    if (file.type !== 'application/pdf') {
      setCvError('Only PDF files are allowed');
      return;
    }
    setCvUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      fd.append('section', 'cv');
      fd.append('hint', file.name);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        setCvError(result.error ?? 'Upload failed');
        return;
      }
      const url = result.files[0].url as string;
      set('cvUrl', url);
    } catch (e) {
      setCvError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setCvUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Field
          label="Full Name"
          value={data.fullName}
          onChange={(v) => set('fullName', v)}
          fullWidth
          required
        />
        <Field label="Nickname" value={data.nickname} onChange={(v) => set('nickname', v)} />
        <Field label="Pronouns" value={data.pronouns} onChange={(v) => set('pronouns', v)} placeholder="She/Her" />
        <Field
          label="Avatar Initials"
          value={data.avatarInitials}
          onChange={(v) => set('avatarInitials', v)}
          maxLength={3}
          hint="Shown when photo is unavailable"
        />
        <Field label="Title" value={data.title} onChange={(v) => set('title', v)} fullWidth />
        <Field label="Subtitle" value={data.subtitle} onChange={(v) => set('subtitle', v)} fullWidth />
        <Field label="Tagline" value={data.tagline} onChange={(v) => set('tagline', v)} fullWidth />
        <Field label="Location" value={data.location} onChange={(v) => set('location', v)} fullWidth />
        <Field
          label="Email"
          value={data.email}
          onChange={(v) => set('email', v)}
          type="email"
        />
        <Field label="Phone" value={data.phone} onChange={(v) => set('phone', v)} />
        <Field
          label="WhatsApp Number"
          value={data.whatsapp}
          onChange={(v) => set('whatsapp', v)}
          hint="With country code, no + (e.g. 6281234567890)"
        />
        <Field
          label="LinkedIn URL"
          value={data.linkedin}
          onChange={(v) => set('linkedin', v)}
          type="url"
        />
        <Field
          label="GitHub URL"
          value={data.github ?? ''}
          onChange={(v) => set('github', v)}
          type="url"
        />
        <Field
          label="Instagram URL"
          value={data.instagram}
          onChange={(v) => set('instagram', v)}
          type="url"
        />
        <Field
          label="Avatar Color"
          value={data.avatarColor}
          onChange={(v) => set('avatarColor', v)}
          placeholder="#16a34a"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
          Profile Photo
        </label>
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-border bg-bg-tertiary shrink-0 flex items-center justify-center">
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.photoUrl} alt={data.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-text-muted">No image</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-xs hover:scale-105 transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                {photoUploading ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={photoUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhoto(file);
                    e.target.value = '';
                  }}
                />
              </label>
              {data.photoUrl && (
                <button
                  type="button"
                  onClick={() => set('photoUrl', '')}
                  className="px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            {photoError && <p className="text-xs text-red-500">{photoError}</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
          CV (PDF)
        </label>
        <div className="flex items-start gap-4">
          <div className="w-24 h-32 rounded-xl overflow-hidden border border-border bg-bg-tertiary shrink-0 flex items-center justify-center">
            {data.cvUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-red-500 bg-red-500/5 p-2">
                <FileText className="w-8 h-8 mb-1" />
                <span className="text-[9px] text-center break-all px-1 line-clamp-3">
                  {data.cvUrl.split('/').pop()}
                </span>
              </div>
            ) : (
              <span className="text-xs text-text-muted text-center px-2">No CV uploaded</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-xs hover:scale-105 transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                {cvUploading ? 'Uploading...' : 'Upload PDF'}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  disabled={cvUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadCv(file);
                    e.target.value = '';
                  }}
                />
              </label>
              {data.cvUrl && (
                <a
                  href={data.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg text-xs glass hover:scale-105 transition-all"
                >
                  Preview
                </a>
              )}
              {data.cvUrl && (
                <button
                  type="button"
                  onClick={() => set('cvUrl', '')}
                  className="px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            {cvError && <p className="text-xs text-red-500">{cvError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}