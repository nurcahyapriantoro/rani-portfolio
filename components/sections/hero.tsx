'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowDown, Mail, Download, Sparkles } from 'lucide-react';
import { DNASceneClient } from '../three/dna-scene-client';

export function Hero() {
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

  const nameChars = t('name').split('');

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-soft via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--accent-glow) 0%, transparent 50%), radial-gradient(circle at 80% 80%, var(--accent-glow) 0%, transparent 50%)`
          }}
        />
      </div>

      <div className="absolute inset-0 -z-10 opacity-60">
        <DNASceneClient />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center" ref={containerRef}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-fade-up">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">{t('greeting')}</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
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
              {t('title')}
            </p>
            <p className="text-base md:text-lg text-text-muted max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row gap-3 justify-center mt-10 animate-fade-up opacity-0"
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
              href="/cv-rani-andriani-tunggal.pdf"
              download
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass font-semibold hover:scale-105 transition-all shine"
            >
              <Download className="w-4 h-4" />
              {t('cta_cv')}
            </a>
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