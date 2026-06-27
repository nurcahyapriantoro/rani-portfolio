'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, MessageCircle, MapPin, Linkedin, Instagram, Github } from 'lucide-react';

interface Profile {
  email: string;
  phone?: string;
  whatsapp?: string;
  location: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  fullName: string;
  cvUrl?: string;
}

export function Contact({ profile }: { profile: Profile }) {
  const t = useTranslations('contact');
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

  const waLink = profile.whatsapp
    ? `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(
        `Hi ${profile.fullName.split(' ')[0]}, I'd like to connect with you.`
      )}`
    : '#';

  const mailtoLink = `mailto:${profile.email}?subject=${encodeURIComponent(
    `Hello ${profile.fullName.split(' ')[0]}`
  )}`;

  const socials = [
    { icon: Linkedin, href: profile.linkedin, label: 'LinkedIn' },
    { icon: Github, href: profile.github, label: 'GitHub' },
    { icon: Instagram, href: profile.instagram, label: 'Instagram' }
  ].filter((s) => s.href);

  return (
    <section id="contact" ref={ref} className="py-24 md:py-32 relative opacity-0">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-accent" />
          <span className="text-sm font-mono uppercase tracking-widest text-accent">
            {t('label')}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {t('title')}
            </h2>
            <p className="text-text-muted text-lg mb-12">{t('subtitle')}</p>

            <div className="space-y-6">
              <a
                href={mailtoLink}
                className="group flex items-center gap-4 p-4 rounded-2xl glass hover:scale-[1.02] transition-all shine"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-bg-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-text-muted">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </a>

              {profile.whatsapp && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 rounded-2xl glass hover:scale-[1.02] transition-all shine"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 text-bg-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted">WhatsApp</p>
                    <p className="font-medium">{profile.phone || profile.whatsapp}</p>
                  </div>
                </a>
              )}

              <div className="flex items-center gap-4 p-4 rounded-2xl glass">
                <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-text-muted">{t('location')}</p>
                  <p className="font-medium">{profile.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 rounded-3xl glass relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 100% 0%, var(--accent-glow) 0%, transparent 50%)`
              }}
            />
            <div className="relative">
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
                {t('title')}
              </h3>
              <p className="text-text-muted mb-8">{t('subtitle')}</p>

              <div className="flex flex-col gap-3">
                <a
                  href={mailtoLink}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-all hover:scale-105 hover:shadow-lg"
                  style={{ boxShadow: 'var(--shadow)' }}
                >
                  <Mail className="w-5 h-5" />
                  {t('send_email')}
                </a>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl glass font-semibold hover:scale-105 transition-all shine"
                >
                  <MessageCircle className="w-5 h-5 text-accent" />
                  {t('send_wa')}
                </a>
              </div>

              {socials.length > 0 && (
                <>
                  <div className="mt-10 mb-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs uppercase tracking-widest text-text-muted">
                      {t('follow')}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="flex gap-3">
                    {socials.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="w-12 h-12 rounded-xl glass flex items-center justify-center hover:scale-110 hover:bg-accent-soft transition-all"
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}