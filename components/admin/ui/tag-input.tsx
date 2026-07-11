'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  fullWidth?: boolean;
  hint?: string;
}

export function TagInput({
  label,
  values,
  onChange,
  placeholder = 'Type and press Enter',
  fullWidth,
  hint
}: TagInputProps) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...values, trimmed]);
    setDraft('');
  };

  const remove = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      remove(values.length - 1);
    }
  };

  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      {label && (
        <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">{label}</label>
      )}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-tertiary border border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft transition-all min-h-[44px]">
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-accent-soft text-accent border border-accent/30"
          >
            {v}
            <button
              type="button"
              onClick={() => remove(i)}
              className="hover:text-red-500 transition-colors"
              aria-label={`Remove ${v}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={commit}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
        />
        {draft && (
          <button
            type="button"
            onClick={commit}
            className="p-1 rounded text-accent hover:bg-accent-soft"
            aria-label="Add tag"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}