'use client';

import { Mail, Linkedin, Instagram, Github, MessageCircle, ExternalLink, Heart } from 'lucide-react';
import type { ProfileInput, FooterInput } from '@/lib/schemas';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  instagram: Instagram,
  github: Github,
  whatsapp: MessageCircle,
  email: Mail,
  twitter: Mail,
  youtube: Mail,
  website: ExternalLink
};

export function Footer({ profile, footer }: { profile: ProfileInput; footer: FooterInput }) {
  const socials = footer.socials ?? [];
  const year = new Date().getFullYear();

  return (
    <footer className="py-6 md:py-10 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg-primary font-bold text-xs">
                {profile.avatarInitials || 'RT'}
              </div>
              <div>
                <p className="font-display font-semibold text-xs md:text-sm">{profile.fullName}</p>
                <p className="text-[10px] md:text-xs text-text-muted">{footer.copyright}</p>
              </div>
            </div>

            {socials.length > 0 && (
              <div className="flex items-center gap-1.5">
                {socials.map((s, i) => {
                  const Icon = ICON_MAP[s.icon ?? ''] ?? ExternalLink;
                  return (
                    <a
                      key={`${s.platform}-${i}`}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:scale-110 hover:bg-accent-soft transition-all"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {footer.tagline && (
            <p className="text-center text-[10px] md:text-xs text-text-muted italic">{footer.tagline}</p>
          )}

          {footer.builtWith && (
            <div className="flex items-center justify-center gap-1.5 text-[10px] md:text-xs text-text-muted">
              <span>{footer.builtWith}</span>
              <Heart className="w-3 h-3 text-accent fill-accent" />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}