'use client';

import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const year = 2025;

  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-bg-primary font-bold">
              RT
            </div>
            <div>
              <p className="font-display font-semibold">Rani Andriani Tunggal</p>
              <p className="text-xs text-text-muted">© {year} · {t('rights')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{t('built_with')}</span>
            <Heart className="w-3 h-3 text-accent fill-accent" />
          </div>
        </div>
      </div>
    </footer>
  );
}