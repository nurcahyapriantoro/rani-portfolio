'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GraduationCap, MapPin, Calendar } from 'lucide-react';

export function Education() {
  const t = useTranslations('education');
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up');
            entry.target.classList.remove('opacity-0');
          }
        });
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="education" ref={ref} className="py-24 md:py-32 relative opacity-0">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-accent" />
          <span className="text-sm font-mono uppercase tracking-widest text-accent">
            {t('label')}
          </span>
        </div>

        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-12">
          {t('title')}
        </h2>

        <div className="relative">
          <div className="group relative p-8 md:p-12 rounded-3xl glass gradient-border shine overflow-hidden">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle at 90% 10%, var(--accent-glow) 0%, transparent 50%)`
              }}
            />

            <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                    <GraduationCap className="w-8 h-8 text-bg-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-1">
                      {t('school')}
                    </h3>
                    <p className="text-text-secondary font-medium">
                      {t('degree')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-6 text-sm text-text-muted">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span>{t('period')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span>{t('location')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-7xl md:text-8xl font-display font-black text-accent opacity-20 leading-none">
                  IPB
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-text-muted">
                  2026
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-divider mt-24" />
    </section>
  );
}