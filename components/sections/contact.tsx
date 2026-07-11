'use client';

import { useEffect, useRef } from 'react';
import { Mail, MessageCircle, MapPin } from 'lucide-react';
import type { ProfileInput } from '@/lib/schemas';

export function Contact({ profile }: { profile: ProfileInput }) {
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

  return (
    <section id="contact" ref={ref} className="py-14 md:py-20 relative opacity-0">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-10 bg-accent" />
          <span className="text-xs font-mono uppercase tracking-widest text-accent">Contact</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              Get in Touch
            </h2>
            <p className="text-xs md:text-sm text-text-muted mb-6 md:mb-8">
              Let's connect for collaborations or just a friendly chat
            </p>

            <div className="space-y-3">
              <a
                href={mailtoLink}
                className="group flex items-center gap-3 p-3 md:p-4 rounded-2xl glass hover:scale-[1.02] transition-all shine"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <Mail className="w-4 h-4 text-bg-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted">Email</p>
                  <p className="text-xs md:text-sm font-medium truncate">{profile.email}</p>
                </div>
              </a>

              {profile.whatsapp && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 md:p-4 rounded-2xl glass hover:scale-[1.02] transition-all shine"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <MessageCircle className="w-4 h-4 text-bg-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted">WhatsApp</p>
                    <p className="text-xs md:text-sm font-medium truncate">{profile.phone || profile.whatsapp}</p>
                  </div>
                </a>
              )}

              <div className="flex items-center gap-3 p-3 md:p-4 rounded-2xl glass">
                <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted">Location</p>
                  <p className="text-xs md:text-sm font-medium truncate">{profile.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7 rounded-2xl glass relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 100% 0%, var(--accent-glow) 0%, transparent 50%)`
              }}
            />
            <div className="relative">
              <h3 className="font-display text-lg md:text-2xl font-bold mb-2">
                Get in Touch
              </h3>
              <p className="text-xs text-text-muted mb-5">
                Let's connect for collaborations or just a friendly chat
              </p>

              <div className="flex flex-col gap-2.5">
                <a
                  href={mailtoLink}
                  className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-bg-primary text-sm font-semibold hover:bg-accent-hover transition-all hover:scale-105 hover:shadow-lg"
                  style={{ boxShadow: 'var(--shadow)' }}
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </a>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl glass text-sm font-semibold hover:scale-105 transition-all shine"
                >
                  <MessageCircle className="w-4 h-4 text-accent" />
                  Send WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}