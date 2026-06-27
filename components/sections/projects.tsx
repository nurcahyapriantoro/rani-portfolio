'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, Users as UsersIcon, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { generateCircleParams } from '@/lib/seeded-random';

export function Projects() {
  const t = useTranslations('projects');
  const circles = generateCircleParams(20);

  return (
    <section className="py-14 md:py-20 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-10 bg-accent" />
          <span className="text-xs font-mono uppercase tracking-widest text-accent">
            {t('label')}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              {t('title')}
            </h2>
            <p className="text-xs md:text-sm text-text-muted mb-4 italic">
              {t('subtitle')}
            </p>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-5">
              {t('description')}
            </p>

            <div className="grid grid-cols-2 gap-2.5 md:gap-3">
              <div className="p-3 rounded-xl glass">
                <Sparkles className="w-4 h-4 text-accent mb-1.5" />
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">{t('impact')}</p>
                <p className="text-xs text-text-secondary font-medium leading-snug">
                  {t('impact_text')}
                </p>
              </div>
              <div className="p-3 rounded-xl glass">
                <UsersIcon className="w-4 h-4 text-accent mb-1.5" />
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">{t('team')}</p>
                <p className="text-xs text-text-secondary font-medium leading-snug">
                  6 researchers from IPB University
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] md:aspect-square rounded-2xl glass gradient-border overflow-hidden relative group">
              <div
                className="absolute inset-0 opacity-30 z-10 mix-blend-overlay"
                style={{
                  backgroundImage: `radial-gradient(circle at 30% 30%, var(--accent-glow) 0%, transparent 50%), radial-gradient(circle at 70% 70%, var(--accent-glow) 0%, transparent 50%)`
                }}
              />

              <Image
                src="/project-pilot.jpg"
                alt="Independent Pilot Program - Horticultural Therapy at Rumah Azaki"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />

              <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none z-20" viewBox="0 0 400 400">
                {circles.map((c, i) => (
                  <circle
                    key={i}
                    cx={c.cx}
                    cy={c.cy}
                    r={c.r}
                    fill="#4ade80"
                  >
                    <animate
                      attributeName="opacity"
                      values="0;1;0"
                      dur={`${c.dur}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}
              </svg>

              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ImageIcon className="w-3 h-3 text-accent" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-accent">
                    {t('published')}
                  </p>
                </div>
                <p className="text-xs md:text-sm font-medium text-white">AGROKREATIF Journal · Jun 2025</p>
              </div>
            </div>

            <div className="absolute -top-2 -right-2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-accent flex items-center justify-center text-bg-primary font-bold text-[10px] md:text-xs shadow-lg animate-float text-center leading-tight px-1">
              80% Impact
            </div>
          </div>
        </div>
      </div>

      <div className="section-divider mt-12 md:mt-20" />
    </section>
  );
}