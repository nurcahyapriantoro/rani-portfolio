'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { BilingualEditor } from '@/components/admin/bilingual-editor';
import { Field } from '@/components/admin/ui/field';
import { updateProfileAction } from '@/lib/actions';
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  formatMB,
  isAllowedImageMime,
  overSizeMessage
} from '@/lib/storage/constants';
import type { ProfileInput } from '@/lib/schemas';

export default function ProfileEditor({
  locale,
  enProfile,
}: {
  locale: string;
  enProfile: ProfileInput;
}) {
  return (
    <BilingualEditor<ProfileInput>
      title="Edit Profile"
      description="Personal information shown across the portfolio. Switch tabs to manage EN/ID translations, then save both at once."
      enData={enProfile}
      onSave={(data) => updateProfileAction(data)}
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
  locale: 'en';
}) {
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const set = <K extends keyof ProfileInput>(field: K, value: ProfileInput[K]) =>
    update((prev) => ({ ...prev, [field]: value }));

  const uploadPhoto = async (file: File) => {
    setPhotoError(null);

    // Reject oversize / wrong-type files BEFORE issuing the request. Without
    // this, an oversize photo gets a 0-byte response from Vercel and the user
    // sees the cryptic "Unexpected end of JSON input" SyntaxError.
    if (!isAllowedImageMime(file)) {
      setPhotoError(
        `"${file.name}" is not a supported image (${file.type || 'unknown file type'}). ` +
          `Please upload a JPG, PNG, WebP, GIF, or SVG.`
      );
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setPhotoError(overSizeMessage(file.name, file.size));
      return;
    }

    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      fd.append('section', 'profile');
      fd.append('hint', file.name);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const body = await res.text();
      let result: { ok?: boolean; error?: string; files?: Array<{ url: string }> };
      try {
        result = body ? JSON.parse(body) : {};
      } catch {
        result = {};
      }
      if (!res.ok || !result.ok || !Array.isArray(result.files)) {
        const reason =
          result.error ||
          (res.status === 413
            ? `File too large for the server. Maximum upload size is ${formatMB(MAX_UPLOAD_BYTES)}.`
            : body
              ? `Upload failed (HTTP ${res.status})`
              : `Upload failed (HTTP ${res.status}): the server returned an empty response. ` +
                `Maximum upload size is ${formatMB(MAX_UPLOAD_BYTES)}. ` +
                `Please compress or resize the image and try again.`);
        setPhotoError(reason);
        console.error('[profile-photo upload]', { status: res.status, body, result });
        return;
      }
      const url = result.files[0].url as string;
      set('photoUrl', url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setPhotoError(`Upload failed: ${msg}. Check your connection and try again.`);
      console.error('[profile-photo upload] network/runtime error', e);
    } finally {
      setPhotoUploading(false);
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
            <p className="text-[11px] text-text-muted">
              Max {MAX_UPLOAD_MB.toFixed(1)} MB · JPG, PNG, WebP, GIF, or SVG.
            </p>
            {photoError && (
              <div
                role="alert"
                className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs space-y-1"
              >
                <p className="font-semibold">Upload failed</p>
                <p>{photoError}</p>
                <p className="text-red-400/80">
                  Tip: maximum upload size is {formatMB(MAX_UPLOAD_BYTES)}. Compress or resize the image and try again.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
