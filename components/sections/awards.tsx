'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Trophy, Award, Medal, Crown } from 'lucide-react';

interface Award {
  id: string;
  rank: string;
  title: string;
  issuer: string;
  date: string;
  associatedWith: string;
}

function getRankIcon(rank: string) {
  if (rank.includes('1')) return Crown;
  if (rank.includes('2')) return Trophy;
  if (rank.includes('3')) return Medal;
  return Award;
}

export function Awards({ awards }: { awards: Award[] }) {
  const t = useTranslations('awards');
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('vanilla-tilt').then((mod) => {
        const init = () => {
          const elements = document.querySelectorAll('.tilt-card');
          if (elements.length > 0 && (mod as any).default) {
            (mod as any).default.init(elements, {
              max: 6,
              speed: 400,
              glare: true,
              'max-glare': 0.1,
              scale: 1.02
            });
          }
        };
        init();
        setTimeout(init, 1000);
      });
    }
  }, []);

  return (
    <section id="awards" ref={ref} className="py-14 md:py-20 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-10 bg-accent" />
          <span className="text-xs font-mono uppercase tracking-widest text-accent">
            {t('label')}
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
          {t('title')}
        </h2>
        <p className="text-xs md:text-sm text-text-muted mb-10 md:mb-14 max-w-2xl">{t('subtitle')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {awards.map((award) => {
            const Icon = getRankIcon(award.rank);
            return (
              <div
                key={award.id}
                className="tilt-card group p-4 md:p-5 rounded-2xl glass shine cursor-pointer"
                data-tilt
                data-tilt-max="6"
                data-tilt-speed="400"
                data-tilt-glare
                data-tilt-max-glare="0.1"
              >
                <div className="tilt-card-inner">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center group-hover:bg-accent transition-colors shrink-0">
                      <Icon className="w-4 h-4 text-accent group-hover:text-bg-primary transition-colors" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-accent text-bg-primary">
                      {award.rank}
                    </span>
                  </div>

                  <h3 className="font-display text-sm md:text-base font-bold mb-2 leading-tight group-hover:text-accent transition-colors line-clamp-3">
                    {award.title}
                  </h3>

                  <div className="space-y-1 text-[11px] md:text-xs text-text-muted">
                    <p className="text-text-secondary font-medium line-clamp-1">{award.issuer}</p>
                    <p>{award.date}</p>
                    {award.associatedWith && (
                      <p className="text-[10px] italic text-accent truncate">@ {award.associatedWith}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-divider mt-12 md:mt-20" />
    </section>
  );
}