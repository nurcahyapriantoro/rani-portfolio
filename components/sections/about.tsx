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
    <section id="about" ref={ref} className="py-14 md:py-20 relative opacity-0">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-10 bg-accent" />
          <span className="text-xs font-mono uppercase tracking-widest text-accent">
            {t('label')}
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 max-w-2xl whitespace-pre-line leading-tight">
          {t('title')}
        </h2>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-10 items-start">
          <p className="text-sm md:text-base text-text-secondary leading-relaxed">
            {t('description')}
          </p>

          <div className="grid grid-cols-2 gap-2.5 md:gap-3">
            {statsItems.map((stat, i) => (
              <div
                key={i}
                className="group relative p-3 md:p-4 rounded-xl glass hover:scale-105 transition-all duration-300 shine"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-soft to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-accent mb-2" />
                  <div className="text-xl md:text-2xl lg:text-3xl font-display font-bold gradient-text mb-0.5">
                    {typeof stat.value === 'string' ? (
                      stat.value
                    ) : (
                      <Counter end={stat.value} suffix={stat.suffix} />
                    )}
                  </div>
                  <div className="text-[10px] md:text-xs uppercase tracking-wider text-text-muted">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-divider mt-12 md:mt-20" />
    </section>
  );
}