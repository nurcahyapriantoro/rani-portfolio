'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Counter } from '../effects/counter';
import { GraduationCap, Briefcase, Trophy, BookOpen } from 'lucide-react';

interface Stats {
  gpa: string;
  experienceCount: number;
  awardsCount: number;
  publicationsCount: number;
}

export function About({ stats }: { stats: Stats }) {
  const t = useTranslations('about');
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

  const statsItems = [
    { icon: GraduationCap, value: stats.gpa, label: t('stats.gpa'), suffix: '' },
    { icon: Briefcase, value: stats.experienceCount, label: t('stats.experience'), suffix: '+' },
    { icon: Trophy, value: stats.awardsCount, label: t('stats.awards'), suffix: '' },
    { icon: BookOpen, value: stats.publicationsCount, label: t('stats.publications'), suffix: '' }
  ];

  return (
    <section id="about" ref={ref} className="py-24 md:py-32 relative opacity-0">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-accent" />
          <span className="text-sm font-mono uppercase tracking-widest text-accent">
            {t('label')}
          </span>
        </div>

        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-12 max-w-3xl whitespace-pre-line">
          {t('title')}
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <p className="text-lg text-text-secondary leading-relaxed">
            {t('description')}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {statsItems.map((stat, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl glass hover:scale-105 transition-all duration-300 shine"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-soft to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <stat.icon className="w-6 h-6 text-accent mb-3" />
                  <div className="text-3xl md:text-4xl font-display font-bold gradient-text mb-1">
                    {typeof stat.value === 'string' ? (
                      stat.value
                    ) : (
                      <Counter end={stat.value} suffix={stat.suffix} />
                    )}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-text-muted">
                    {stat.label}
                  </div>
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