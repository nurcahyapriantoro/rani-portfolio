'use client';

import { forwardRef } from 'react';

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  fullWidth?: boolean;
  maxLength?: number;
  required?: boolean;
  hint?: string;
  error?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, value, onChange, type = 'text', placeholder, fullWidth, maxLength, required, hint, error },
  ref
) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border focus:outline-none focus:ring-2 focus:ring-accent-soft transition-all ${
          error ? 'border-red-500' : 'border-border focus:border-accent'
        }`}
      />
      {hint && !error && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});