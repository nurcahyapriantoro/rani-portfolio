'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowDown, Mail, Download, Sparkles, MapPin } from 'lucide-react';
import Image from 'next/image';
import { DNASceneClient } from '../three/dna-scene-client';

interface HeroProfile {
  fullName: string;
  title: string;
  subtitle: string;
  location: string;
  photoUrl?: string;
  avatarInitials: string;
  cvUrl: string;
}

export function Hero({ profile }: { profile: HeroProfile }) {
  const t = useTranslations('hero');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll('[data-char]');
    chars.forEach((char, i) => {
      const el = char as HTMLElement;
      el.style.animationDelay = `${i * 30}ms`;
    });
  }, []);

  const nameChars = profile.fullName.split('');

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
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
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="relative shrink-0 animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
              <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-br from-accent via-accent-hover to-accent blur-xl opacity-50 animate-glow" />
              <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-bg-primary shadow-2xl ring-2 ring-accent/40">
                {profile.photoUrl ? (
                  <Image
                    src={profile.photoUrl}
                    alt={profile.fullName}
                    fill
                    priority
                    sizes="(max-width: 768px) 160px, 208px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-accent flex items-center justify-center text-bg-primary font-display font-black text-5xl">
                    {profile.avatarInitials}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-accent text-bg-primary text-xs font-bold shadow-lg">
                3.77 GPA
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">{t('greeting')}</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
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

              <div className="animate-fade-up opacity-0" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
                <p className="text-xl md:text-2xl text-text-secondary font-medium mb-2">
                  {profile.title}
                </p>
                <p className="text-base md:text-lg text-text-muted max-w-2xl lg:max-w-none">
                  {profile.subtitle}
                </p>
                <div className="flex items-center gap-2 mt-3 justify-center lg:justify-start text-sm text-text-muted">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>{profile.location}</span>
                </div>
              </div>

              <div
                className="flex flex-col sm:flex-row gap-3 mt-8 lg:justify-start animate-fade-up opacity-0"
                style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}
              >
                <a
                  href="#contact"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-all hover:scale-105 hover:shadow-lg"
                  style={{ boxShadow: 'var(--shadow)' }}
                >
                  <Mail className="w-4 h-4" />
                  {t('cta_contact')}
                </a>
                <a
                  href={profile.cvUrl}
                  download
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass font-semibold hover:scale-105 transition-all shine"
                >
                  <Download className="w-4 h-4" />
                  {t('cta_cv')}
                </a>
              </div>
            </div>
          </div>
        </div>

        <a
          href="#about"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted hover:text-accent transition-colors animate-float"
        >
          <span className="text-xs uppercase tracking-widest">{t('scroll')}</span>
          <ArrowDown className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}