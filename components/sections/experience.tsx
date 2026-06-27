'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Briefcase, MapPin, Calendar } from 'lucide-react';

interface Experience {
  id: string;
  role: string;
  company: string;
  type: string;
  period: string;
  duration: string;
  location: string;
  description: string;
  skills: string[];
}

export function Experience({ experiences }: { experiences: Experience[] }) {
  const t = useTranslations('experience');
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll('[data-timeline-item]');
            items.forEach((item, i) => {
              setTimeout(() => {
                item.classList.add('animate-fade-up');
                item.classList.remove('opacity-0');
              }, i * 100);
            });
          }
        });
      },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="experience" ref={ref} className="py-24 md:py-32 relative">
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

        <div className="relative">
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-accent to-transparent" />

          <div className="space-y-8">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                data-timeline-item
                className="relative pl-12 md:pl-24 opacity-0"
              >
                <div className="absolute left-2 md:left-6 top-6 w-4 h-4 rounded-full bg-accent ring-4 ring-bg-primary shadow-lg" />
                <div className="absolute left-4 md:left-8 top-6 w-0.5 h-px bg-accent hidden md:block" style={{ left: '2rem' }} />

                <div className="group p-6 md:p-8 rounded-2xl glass hover:scale-[1.02] transition-all shine">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-display text-xl md:text-2xl font-bold mb-1 group-hover:text-accent transition-colors">
                        {exp.role}
                      </h3>
                      <p className="text-accent font-medium">{exp.company}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-accent-soft text-accent">
                      {exp.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4 text-xs text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{exp.period} · {exp.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{exp.location}</span>
                    </div>
                  </div>

                  <p className="text-text-secondary leading-relaxed mb-4 text-sm md:text-base">
                    {exp.description}
                  </p>

                  {exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-bg-tertiary text-text-secondary border border-border"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-divider mt-24" />
    </section>
  );
}