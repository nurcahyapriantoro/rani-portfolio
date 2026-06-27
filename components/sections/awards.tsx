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

const RANK_ICONS = ['1st', '2nd', '3rd'];

function getRankIcon(rank: string, index: number) {
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
              max: 8,
              speed: 400,
              glare: true,
              'max-glare': 0.15,
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
    <section id="awards" ref={ref} className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-accent" />
          <span className="text-sm font-mono uppercase tracking-widest text-accent">
            {t('label')}
          </span>
        </div>

        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          {t('title')}
        </h2>
        <p className="text-text-muted text-lg mb-16 max-w-2xl">{t('subtitle')}</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards.map((award, i) => {
            const Icon = getRankIcon(award.rank, i);
            return (
              <div
                key={award.id}
                className="tilt-card group p-6 md:p-8 rounded-3xl glass shine cursor-pointer"
                data-tilt
                data-tilt-max="8"
                data-tilt-speed="400"
                data-tilt-glare
                data-tilt-max-glare="0.15"
              >
                <div className="tilt-card-inner">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center group-hover:bg-accent transition-colors">
                      <Icon className="w-6 h-6 text-accent group-hover:text-bg-primary transition-colors" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-accent text-bg-primary">
                      {award.rank}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold mb-3 leading-tight group-hover:text-accent transition-colors">
                    {award.title}
                  </h3>

                  <div className="space-y-2 text-sm text-text-muted">
                    <p>
                      <span className="text-text-secondary font-medium">{award.issuer}</span>
                    </p>
                    <p className="text-xs">{award.date}</p>
                    {award.associatedWith && (
                      <p className="text-xs italic text-accent">@ {award.associatedWith}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-divider mt-24" />
    </section>
  );
}