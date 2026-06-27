'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Link, usePathname } from '@/lib/navigation';
import { useTheme } from '@/components/theme-provider';
import { useSmoothScroll } from '@/components/effects/smooth-scroll';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
import { cn } from '@/lib/utils';

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const { scrollTo } = useSmoothScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#about', label: t('about') },
    { href: '#education', label: t('education') },
    { href: '#experience', label: t('experience') },
    { href: '#skills', label: t('skills') },
    { href: '#publications', label: t('publications') },
    { href: '#awards', label: t('awards') },
    { href: '#contact', label: t('contact') }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    scrollTo(href, { offset: -64, duration: 1.2 });
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', href);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass shadow-sm py-2' : 'py-3'
      )}
    >
      <nav className="container mx-auto px-3 md:px-5 flex items-center justify-between gap-2">
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault();
              scrollTo(0, { duration: 1.5 });
            }
          }}
          className="flex items-center gap-1.5 group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg-primary font-bold text-xs transition-transform group-hover:scale-110 group-hover:rotate-3">
            RT
          </div>
          <span className="hidden sm:inline font-display font-semibold text-sm text-text-primary">
            Rani<span className="text-accent">.</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-accent transition-colors relative group whitespace-nowrap"
            >
              {item.label}
              <span className="absolute bottom-0.5 left-2.5 right-2.5 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <LanguageSwitcher currentLocale={locale} />
          <button
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              toggleTheme(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:scale-110 transition-transform relative overflow-hidden"
          >
            <span
              key={theme}
              className="absolute inset-0 flex items-center justify-center animate-[theme-switch_400ms_cubic-bezier(0.4,0,0.2,1)]"
            >
              {theme === 'light' ? (
                <Moon className="w-3.5 h-3.5 text-text-primary" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-accent" />
              )}
            </span>
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="lg:hidden w-8 h-8 rounded-lg glass flex items-center justify-center"
          >
            {mobileOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden glass border-t border-border mt-2">
          <div className="container mx-auto px-3 py-2 flex flex-col gap-0.5">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-accent-soft"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}