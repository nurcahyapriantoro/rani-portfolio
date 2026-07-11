'use client';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  required?: boolean;
  className?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  fullWidth,
  required,
  className = ''
}: SelectProps) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      {label && (
        <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all ${className}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}