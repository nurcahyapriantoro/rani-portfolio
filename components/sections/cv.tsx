'use client';

import { useEffect, useRef } from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import type { ProfileInput } from '@/lib/schemas';

export function Cv({ profile }: { profile: ProfileInput }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section || !profile.cvUrl) return;

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

    observer.observe(section);
    return () => observer.disconnect();
  }, [profile.cvUrl]);

  if (!profile.cvUrl) return null;

  return (
    <section id="cv" ref={ref} className="py-14 md:py-20 relative opacity-0">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-10 bg-accent" />
          <span className="text-xs font-mono uppercase tracking-widest text-accent">CV / Resume</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Curriculum Vitae
            </h2>
            <p className="text-xs md:text-sm text-text-muted mt-2">View my complete professional and academic background.</p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl glass text-xs md:text-sm font-semibold hover:scale-105 transition-all shine"
            >
              <ExternalLink className="w-3.5 h-3.5 text-accent" />
              Open PDF
            </a>
            <a
              href={profile.cvUrl}
              download
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-bg-primary text-xs md:text-sm font-semibold hover:bg-accent-hover hover:scale-105 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download CV
            </a>
          </div>
        </div>

        <div className="rounded-2xl glass p-2 md:p-3 overflow-hidden">
          <iframe
            src={profile.cvUrl}
            title={`Curriculum Vitae ${profile.fullName}`}
            className="block w-full h-[520px] sm:h-[640px] md:h-[760px] rounded-xl border border-border bg-bg-tertiary"
          >
            <p className="p-6 text-sm text-text-muted">
              Your browser cannot preview this PDF. Use the Open PDF or Download CV button above.
            </p>
          </iframe>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-text-muted">
          <FileText className="w-3.5 h-3.5 text-accent" />
          <span>Having trouble previewing the document? Open or download the PDF instead.</span>
        </div>
      </div>

      <div className="section-divider mt-12 md:mt-20" />
    </section>
  );
}
