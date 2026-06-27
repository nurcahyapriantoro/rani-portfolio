'use client';

import { useRouter, usePathname } from '@/lib/navigation';
import { Languages } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'id', label: 'ID' }
] as const;

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const switchTo = (newLocale: string) => {
    setOpen(false);
    router.replace(pathname, { locale: newLocale as 'en' | 'id' });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Switch language"
        className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:scale-110 transition-transform gap-0.5 px-2"
      >
        <Languages className="w-4 h-4" />
        <span className="text-xs font-bold uppercase">{currentLocale}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 glass rounded-xl overflow-hidden min-w-[80px] shadow-lg">
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => switchTo(loc.code)}
                className={cn(
                  'w-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent-soft',
                  currentLocale === loc.code && 'bg-accent-soft text-accent'
                )}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}