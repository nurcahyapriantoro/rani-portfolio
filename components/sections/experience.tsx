'use client';

import { useEffect, useRef } from 'react';
import { Briefcase, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { ImageSlider } from '../effects/image-slider';
import type { ExperienceInput } from '@/lib/schemas';

export function Experience({ experiences }: { experiences: ExperienceInput[] }) {
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
              }, i * 80);
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
    <section id="experience" ref={ref} className="py-14 md:py-20 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-10 bg-accent" />
          <span className="text-xs font-mono uppercase tracking-widest text-accent">
            Experience
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
          Professional Path
        </h2>
        <p className="text-xs md:text-sm text-text-muted mb-10 md:mb-14 max-w-2xl">
          A timeline of laboratory, research, and leadership experiences
        </p>

        <div className="relative">
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-accent to-transparent" />

          <div className="space-y-5 md:space-y-7">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                data-timeline-item
                className="relative pl-10 md:pl-20 opacity-0"
              >
                <div className="absolute left-2 md:left-6 top-5 w-3.5 h-3.5 rounded-full bg-accent ring-4 ring-bg-primary shadow-lg" />

                <div className="group p-4 md:p-6 rounded-2xl glass hover:scale-[1.01] transition-all shine">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base md:text-xl font-bold mb-0.5 group-hover:text-accent transition-colors leading-tight">
                        {exp.role}
                      </h3>
                      {exp.companyUrl ? (
                        <a
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs md:text-sm text-accent font-medium truncate inline-flex items-center gap-1 hover:underline"
                        >
                          {exp.company}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="text-xs md:text-sm text-accent font-medium truncate">{exp.company}</p>
                      )}
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-mono uppercase tracking-wider bg-accent-soft text-accent">
                      {exp.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 md:gap-3 mb-2 text-[11px] md:text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {exp.period}
                        {exp.isCurrent && (
                          <span className="ml-1 px-1.5 py-0.5 rounded bg-accent text-bg-primary font-bold">Present</span>
                        )}
                        {' · '}{exp.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{exp.location}</span>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-3 whitespace-pre-line">
                    {exp.description}
                  </p>

                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="mb-3 space-y-1">
                      {exp.achievements.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-text-secondary">
                          <span className="text-accent mt-1 shrink-0">▸</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {exp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md text-[10px] md:text-xs font-medium bg-bg-tertiary text-text-secondary border border-border"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {exp.images && exp.images.length > 0 && (
                    <ImageSlider images={exp.images} alt={exp.role} maxWidth="xs" />
                  )}
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