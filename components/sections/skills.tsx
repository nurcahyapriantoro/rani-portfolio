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
              }, i * 80);
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
    <section id="skills" ref={ref} className="py-24 md:py-32 relative opacity-0">
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

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(grouped).map(([category, items]) => {
            const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Microscope;
            return (
              <div
                key={category}
                className="p-6 md:p-8 rounded-3xl glass"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-display text-xl font-bold capitalize">
                    {t(`categories.${category}`)}
                  </h3>
                </div>

                <div className="space-y-4">
                  {items.map((skill) => (
                    <div
                      key={skill.name}
                      data-skill-card
                      className="opacity-0 transition-all duration-500"
                      style={{ transform: 'translateY(20px)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-xs font-mono text-text-muted">{skill.level}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
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

      <div className="section-divider mt-24" />
    </section>
  );
}