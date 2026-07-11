'use client';

import { useEffect, useRef } from 'react';
import { ArrowDown, Mail, Download, Sparkles, MapPin } from 'lucide-react';
import Image from 'next/image';
import { DNASceneClient } from '../three/dna-scene-client';
import type { ProfileInput, HeroInput } from '@/lib/schemas';

interface HeroProfile {
  fullName: string;
  title: string;
  subtitle: string;
  location: string;
  photoUrl?: string;
  avatarInitials: string;
  cvUrl: string;
}

export function Hero({ profile, hero, gpa }: { profile: ProfileInput; hero: HeroInput; gpa?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll('[data-char]');
    chars.forEach((char, i) => {
      const el = char as HTMLElement;
      el.style.animationDelay = `${i * 20}ms`;
    });
  }, []);

  const nameChars = profile.fullName.split('');
  const greeting = hero?.greeting || "Hello, I'm";
  const scrollLabel = hero?.scrollLabel || 'Scroll to explore';

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-8"
    >
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-soft via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--accent-glow) 0%, transparent 50%), radial-gradient(circle at 80% 80%, var(--accent-glow) 0%, transparent 50%)`
          }}
        />
      </div>

      <div className="absolute inset-0 -z-10 opacity-50 pointer-events-none">
        <DNASceneClient />
      </div>

      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, var(--bg-primary) 0%, var(--bg-primary) 35%, transparent 70%)'
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto" ref={containerRef}>
          <div className="flex flex-col lg:flex-row items-center gap-5 lg:gap-8">
            <div className="relative shrink-0 animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
              <div className="absolute inset-0 -m-1.5 rounded-full bg-gradient-to-br from-accent via-accent-hover to-accent blur-lg opacity-50 animate-glow" />
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-[3px] border-bg-primary shadow-xl ring-2 ring-accent/40">
                {profile.photoUrl ? (
                  <Image
                    src={profile.photoUrl}
                    alt={profile.fullName}
                    fill
                    priority
                    sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-accent flex items-center justify-center text-bg-primary font-display font-black text-3xl">
                    {profile.avatarInitials}
                  </div>
                )}
              </div>
              {gpa && (
                <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-accent text-bg-primary text-[10px] font-bold shadow-lg">
                  {gpa} GPA
                </div>
              )}
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass mb-4 animate-fade-up opacity-0 text-xs" style={{ animationFillMode: 'forwards' }}>
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="font-medium">{greeting}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-[1.05] tracking-tight">
                <span className="block">
                  {nameChars.map((char, i) => (
                    <span
                      key={i}
                      data-char
                      className="inline-block animate-fade-up opacity-0 gradient-text"
                      style={{ animationFillMode: 'forwards' }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </span>
              </h1>

              <div className="animate-fade-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                <p className="text-base md:text-lg text-text-secondary font-medium mb-1">
                  {profile.title}
                </p>
                <p className="text-xs md:text-sm text-text-muted max-w-xl lg:max-w-none">
                  {profile.subtitle}
                </p>
                <div className="flex items-center gap-1.5 mt-2 justify-center lg:justify-start text-xs text-text-muted">
                  <MapPin className="w-3 h-3 text-accent" />
                  <span>{profile.location}</span>
                </div>
              </div>

              <div
                className="flex flex-col sm:flex-row gap-2 mt-5 lg:justify-start animate-fade-up opacity-0"
                style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}
              >
                <a
                  href="#contact"
                  className="group inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent text-bg-primary text-sm font-semibold hover:bg-accent-hover transition-all hover:scale-105 hover:shadow-lg"
                  style={{ boxShadow: 'var(--shadow)' }}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Get in touch
                </a>
                <a
                  href={profile.cvUrl}
                  download
                  className="group inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl glass text-sm font-semibold hover:scale-105 transition-all shine"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CV
                </a>
              </div>
            </div>
          </div>
        </div>

        <a
          href="#about"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-text-muted hover:text-accent transition-colors animate-float"
        >
          <span className="text-[10px] uppercase tracking-widest">{scrollLabel}</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
}