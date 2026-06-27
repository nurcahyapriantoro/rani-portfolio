'use client';

import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const year = 2025;

  return (
    <footer className="py-6 md:py-8 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg-primary font-bold text-xs">
              RT
            </div>
            <div>
              <p className="font-display font-semibold text-xs md:text-sm">Rani Andriani Tunggal</p>
              <p className="text-[10px] md:text-xs text-text-muted">© {year} · {t('rights')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-text-muted">
            <span>{t('built_with')}</span>
            <Heart className="w-3 h-3 text-accent fill-accent" />
          </div>
        </div>
      </div>
    </footer>
  );
}