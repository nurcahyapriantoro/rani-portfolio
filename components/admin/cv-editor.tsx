'use client';

import { useEffect, useState, useTransition } from 'react';
import { AlertCircle, Check, Download, ExternalLink, FileText, Loader2, Save, Trash2, Upload, X } from 'lucide-react';
import { updateCvUrlAction } from '@/lib/actions';
import { Field } from '@/components/admin/ui/field';

export default function CvEditor({ initialCvUrl }: { initialCvUrl: string }) {
  const [cvUrl, setCvUrl] = useState(initialCvUrl);
  const [savedCvUrl, setSavedCvUrl] = useState(initialCvUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = cvUrl !== savedCvUrl;

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const uploadCv = async (file: File) => {
    setUploadError(null);
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are allowed');
      return;
    }
    if (file.size > 1024 * 1024) {
      setUploadError('PDF must be 1MB or smaller');
      return;
    }
    if (file.size === 0) {
      setUploadError('PDF cannot be empty');
      return;
    }

    const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (String.fromCharCode(...signature) !== '%PDF-') {
      setUploadError('The selected file is not a valid PDF');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('section', 'cv');
      formData.append('hint', file.name);

      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setUploadError(result.error ?? 'Upload failed');
        return;
      }

      setCvUrl(result.files[0].url as string);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    startTransition(async () => {
      try {
        await updateCvUrlAction(cvUrl);
        setSavedCvUrl(cvUrl);
        setToast({ type: 'success', message: 'CV saved successfully' });
      } catch (error) {
        setToast({
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to save CV'
        });
      }
    });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Manage CV</h1>
          <p className="text-text-muted text-sm">Upload, preview, and publish the PDF shown on your portfolio.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={pending || uploading || !dirty}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-all disabled:opacity-70 disabled:cursor-not-allowed min-w-[132px] justify-center"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {pending ? 'Saving...' : 'Save CV'}
        </button>
      </div>

      {dirty && !pending && (
        <div className="px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" />
          You have unsaved changes
        </div>
      )}

      <div className="rounded-2xl glass p-6 space-y-6">
        <Field
          label="CV PDF URL"
          type="url"
          value={cvUrl}
          onChange={setCvUrl}
          placeholder="https://.../resume.pdf"
          fullWidth
          hint="Paste a public HTTPS PDF URL or upload a new file below."
        />

        <div>
            <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Upload CV (PDF, max 1MB)</label>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-xs hover:scale-105 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : 'Upload PDF'}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={uploading || pending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadCv(file);
                  event.target.value = '';
                }}
              />
            </label>
            {cvUrl && (
              <button
                type="button"
                onClick={() => setCvUrl('')}
                disabled={pending || uploading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-70"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove CV
              </button>
            )}
          </div>
          {uploadError && <p className="mt-2 text-xs text-red-500">{uploadError}</p>}
        </div>

        {cvUrl ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4 text-accent" />
              PDF Preview
            </div>
            <iframe
              src={cvUrl}
              title="CV PDF preview"
              className="w-full h-[420px] md:h-[600px] rounded-xl border border-border bg-bg-tertiary"
            >
              Your browser does not support PDF previews.
            </iframe>
            <div className="flex flex-wrap gap-2">
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-xs hover:scale-105 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open PDF
              </a>
              <a
                href={cvUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-xs hover:scale-105 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </a>
            </div>
          </div>
        ) : (
          <div className="min-h-52 rounded-xl border border-dashed border-border bg-bg-tertiary/50 flex flex-col items-center justify-center text-center p-6">
            <FileText className="w-10 h-10 text-text-muted mb-3" />
            <p className="font-medium text-sm">No CV selected</p>
            <p className="text-xs text-text-muted mt-1">Upload a PDF or paste its public HTTPS URL to preview it here.</p>
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm animate-fade-up z-50 ${
            toast.type === 'success'
              ? 'bg-accent-soft border-accent text-accent'
              : 'bg-red-500/10 border-red-500 text-red-500'
          }`}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 opacity-70 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
