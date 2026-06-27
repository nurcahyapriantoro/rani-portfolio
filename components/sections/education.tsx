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
    <section id="education" ref={ref} className="py-14 md:py-20 relative opacity-0">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-10 bg-accent" />
          <span className="text-xs font-mono uppercase tracking-widest text-accent">
            {t('label')}
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 leading-tight">
          {t('title')}
        </h2>

        <div className="relative">
          <div className="group relative p-5 md:p-8 rounded-2xl glass gradient-border shine overflow-hidden">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle at 90% 10%, var(--accent-glow) 0%, transparent 50%)`
              }}
            />

            <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-accent flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-bg-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg md:text-2xl font-bold mb-0.5">
                      {t('school')}
                    </h3>
                    <p className="text-xs md:text-base text-text-secondary font-medium">
                      {t('degree')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 md:gap-4 mt-3 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>{t('period')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span>{t('location')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-start md:items-end gap-3 md:gap-1 md:text-right">
                <div className="text-4xl md:text-6xl font-display font-black text-accent opacity-20 leading-none">
                  IPB
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                  Graduation 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-divider mt-12 md:mt-20" />
    </section>
  );
}