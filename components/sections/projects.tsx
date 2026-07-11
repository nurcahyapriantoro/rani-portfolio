'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Users as UsersIcon, ImageIcon, Award, Heart, ExternalLink, Calendar } from 'lucide-react';
import Image from 'next/image';
import type { ProjectInput, CertificationInput, VolunteeringInput } from '@/lib/schemas';

export function Projects({
  projects,
  certifications,
  volunteering
}: {
  projects: ProjectInput[];
  certifications: CertificationInput[];
  volunteering: VolunteeringInput[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (projects.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % projects.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [projects.length]);

  const active = projects[activeIndex];

  return (
    <section className="py-14 md:py-20 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-10 bg-accent" />
          <span className="text-xs font-mono uppercase tracking-widest text-accent">
            Projects
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-sm">No projects to display yet.</div>
        ) : active ? (
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                {active.title}
              </h2>
              {active.subtitle && (
                <p className="text-xs md:text-sm text-text-muted mb-4 italic">{active.subtitle}</p>
              )}
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-5 whitespace-pre-line">
                {active.description}
              </p>

              <div className="grid grid-cols-2 gap-2.5 md:gap-3 mb-4">
                {active.impact && (
                  <div className="p-3 rounded-xl glass">
                    <Sparkles className="w-4 h-4 text-accent mb-1.5" />
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">{active.impactLabel ?? 'Impact'}</p>
                    <p className="text-xs text-text-secondary font-medium leading-snug">{active.impact}</p>
                  </div>
                )}
                {active.team && (
                  <div className="p-3 rounded-xl glass">
                    <UsersIcon className="w-4 h-4 text-accent mb-1.5" />
                    <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Team</p>
                    <p className="text-xs text-text-secondary font-medium leading-snug">{active.team}</p>
                  </div>
                )}
              </div>

              {active.tags && active.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {active.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md text-[10px] md:text-xs font-medium bg-bg-tertiary text-text-secondary border border-border">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {active.url && (
                <a
                  href={active.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-xs text-accent hover:underline"
                >
                  View project <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="relative">
              <div className="aspect-[4/3] md:aspect-square rounded-2xl glass gradient-border overflow-hidden relative group">
                <div
                  className="absolute inset-0 opacity-30 z-10 mix-blend-overlay"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 30%, var(--accent-glow) 0%, transparent 50%), radial-gradient(circle at 70% 70%, var(--accent-glow) 0%, transparent 50%)`
                  }}
                />

                {active.imageUrl && (
                  <Image
                    src={active.imageUrl}
                    alt={active.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                )}

                {(active.publishedAt || active.venue) && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
                    {active.venue && (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <ImageIcon className="w-3 h-3 text-accent" />
                        <p className="text-[10px] font-mono uppercase tracking-widest text-accent">Published</p>
                      </div>
                    )}
                    <p className="text-xs md:text-sm font-medium text-white">
                      {active.venue}
                      {active.venue && active.publishedAt && ' · '}
                      {active.publishedAt}
                    </p>
                  </div>
                )}
              </div>

              {active.impact && (
                <div className="absolute -top-2 -right-2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-accent flex items-center justify-center text-bg-primary font-bold text-[10px] md:text-xs shadow-lg animate-float text-center leading-tight px-1">
                  {active.impact} {active.impactLabel ?? 'Impact'}
                </div>
              )}

              {projects.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {projects.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Project ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeIndex ? 'w-6 bg-accent' : 'w-1.5 bg-border'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {(certifications.length > 0 || volunteering.length > 0) && (
          <div className="grid md:grid-cols-2 gap-4 mt-12 md:mt-16">
            {certifications.length > 0 && (
              <div className="p-5 rounded-2xl glass">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-accent" />
                  <h3 className="font-display text-base font-bold">Certifications</h3>
                </div>
                <ul className="space-y-2.5">
                  {certifications.map((cert) => (
                    <li key={cert.id} className="text-xs">
                      <div className="font-medium text-text-secondary">{cert.title}</div>
                      <div className="text-text-muted mt-0.5">
                        {cert.issuer} · {cert.date}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {volunteering.length > 0 && (
              <div className="p-5 rounded-2xl glass">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-4 h-4 text-accent" />
                  <h3 className="font-display text-base font-bold">Volunteering</h3>
                </div>
                <ul className="space-y-2.5">
                  {volunteering.map((vol) => (
                    <li key={vol.id} className="text-xs">
                      <div className="font-medium text-text-secondary">{vol.role}</div>
                      <div className="text-text-muted mt-0.5">
                        {vol.organization}
                        {vol.period && ` · ${vol.period}`}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="section-divider mt-12 md:mt-20" />
    </section>
  );
}