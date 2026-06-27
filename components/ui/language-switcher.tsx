'use client';

import { useRouter, usePathname } from '@/lib/navigation';
import { Languages } from 'lucide-react';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

const OTHER_LOCALE_LABEL: Record<string, string> = {
  en: 'ID',
  id: 'EN'
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const targetLocale = currentLocale === 'en' ? 'id' : 'en';
  const targetLabel = OTHER_LOCALE_LABEL[currentLocale] || 'EN';

  const toggle = () => {
    startTransition(() => {
      router.replace(pathname, { locale: targetLocale as 'en' | 'id' });
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-label={`Switch language to ${targetLabel}`}
      title={`Switch to ${targetLabel}`}
      className={cn(
        'h-10 px-3 rounded-xl glass flex items-center justify-center gap-1.5 hover:scale-110 transition-all font-mono text-xs font-bold uppercase',
        pending && 'opacity-60 cursor-wait'
      )}
    >
      <Languages className="w-4 h-4" />
      <span className="text-text-muted">{currentLocale}</span>
      <span className="text-text-muted">→</span>
      <span className="text-accent">{targetLabel}</span>
    </button>
  );
}