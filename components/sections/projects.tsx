'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, Users as UsersIcon, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { generateCircleParams } from '@/lib/seeded-random';

export function Projects() {
  const t = useTranslations('projects');
  const circles = generateCircleParams(20);

  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-accent" />
          <span className="text-sm font-mono uppercase tracking-widest text-accent">
            {t('label')}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {t('title')}
            </h2>
            <p className="text-text-muted text-lg mb-6 italic">
              {t('subtitle')}
            </p>
            <p className="text-text-secondary leading-relaxed mb-8">
              {t('description')}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl glass">
                <Sparkles className="w-5 h-5 text-accent mb-2" />
                <p className="text-xs uppercase tracking-wider text-text-muted mb-1">{t('impact')}</p>
                <p className="text-sm text-text-secondary font-medium leading-snug">
                  {t('impact_text')}
                </p>
              </div>
              <div className="p-4 rounded-xl glass">
                <UsersIcon className="w-5 h-5 text-accent mb-2" />
                <p className="text-xs uppercase tracking-wider text-text-muted mb-1">{t('team')}</p>
                <p className="text-sm text-text-secondary font-medium leading-snug">
                  6 researchers from IPB University
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl glass gradient-border overflow-hidden relative group">
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

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="w-3.5 h-3.5 text-accent" />
                  <p className="text-xs font-mono uppercase tracking-widest text-accent">
                    {t('published')}
                  </p>
                </div>
                <p className="text-sm font-medium text-white">AGROKREATIF Journal · Jun 2025</p>
              </div>
            </div>

            <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-accent flex items-center justify-center text-bg-primary font-bold text-sm shadow-lg animate-float">
              80% Impact
            </div>
          </div>
        </div>
      </div>

      <div className="section-divider mt-24" />
    </section>
  );
}