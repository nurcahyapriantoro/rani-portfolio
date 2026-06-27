'use client';

import { useTranslations } from 'next-intl';
import { Leaf, Sparkles, Users as UsersIcon } from 'lucide-react';

export function Projects() {
  const t = useTranslations('projects');

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
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `radial-gradient(circle at 30% 30%, var(--accent-glow) 0%, transparent 50%), radial-gradient(circle at 70% 70%, var(--accent-glow) 0%, transparent 50%)`
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Leaf className="w-32 h-32 text-accent animate-float" />
              </div>

              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 400">
                {[...Array(20)].map((_, i) => (
                  <circle
                    key={i}
                    cx={Math.random() * 400}
                    cy={Math.random() * 400}
                    r={Math.random() * 2 + 1}
                    fill="currentColor"
                    className="text-accent"
                  >
                    <animate
                      attributeName="opacity"
                      values="0;1;0"
                      dur={`${Math.random() * 3 + 2}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}
              </svg>

              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-bg-secondary/80 backdrop-blur-md">
                <p className="text-xs font-mono uppercase tracking-widest text-accent mb-1">
                  {t('published')}
                </p>
                <p className="text-sm font-medium">AGROKREATIF Journal · Jun 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-divider mt-24" />
    </section>
  );
}