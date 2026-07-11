'use client';

import { forwardRef } from 'react';

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  fullWidth?: boolean;
  required?: boolean;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, value, onChange, rows = 3, placeholder, fullWidth, required, hint },
  ref
) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all resize-none"
      />
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
});