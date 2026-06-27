'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Microscope, Atom, BarChart3, Users } from 'lucide-react';

interface Skill {
  name: string;
  category: 'molecular' | 'analysis' | 'laboratory' | 'soft';
  level: number;
}

const CATEGORY_ICONS = {
  molecular: Atom,
  analysis: BarChart3,
  laboratory: Microscope,
  soft: Users
} as const;

export function Skills({ skills }: { skills: Skill[] }) {
  const t = useTranslations('skills');
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up');
            entry.target.classList.remove('opacity-0');
            const cards = entry.target.querySelectorAll('[data-skill-card]');
            cards.forEach((card, i) => {
              setTimeout(() => {
                (card as HTMLElement).style.opacity = '1';
                (card as HTMLElement).style.transform = 'translateY(0)';
              }, i * 60);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <section id="skills" ref={ref} className="py-14 md:py-20 relative opacity-0">
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

        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
          {Object.entries(grouped).map(([category, items]) => {
            const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Microscope;
            return (
              <div
                key={category}
                className="p-4 md:p-5 rounded-2xl glass"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="font-display text-base md:text-lg font-bold capitalize">
                    {t(`categories.${category}`)}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {items.map((skill) => (
                    <div
                      key={skill.name}
                      data-skill-card
                      className="opacity-0 transition-all duration-500"
                      style={{ transform: 'translateY(15px)' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs md:text-sm font-medium">{skill.name}</span>
                        <span className="text-[10px] md:text-xs font-mono text-text-muted">{skill.level}%</span>
                      </div>
                      <div className="h-1 md:h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-1000"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
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