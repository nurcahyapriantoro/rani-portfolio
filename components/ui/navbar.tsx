'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  photoUrl?: string;
  avatarInitials: string;
  showCv?: boolean;
  showPortfolio?: boolean;
}

const NAV_ITEMS = [
  { href: '#about', label: 'About' },
  { href: '#education', label: 'Education' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#publications', label: 'Publications' },
  { href: '#awards', label: 'Awards' },
  { href: '#contact', label: 'Contact' }
];

export function Navbar({ photoUrl: _photoUrl, avatarInitials: _avatarInitials, showCv = false, showPortfolio = false }: NavbarProps) {
  const navItems = (() => {
    let items = NAV_ITEMS;
    if (showCv) {
      items = [...items.slice(0, -1), { href: '#cv', label: 'CV' }, items[items.length - 1]];
    }
    if (showPortfolio) {
      items = [...items.slice(0, -1), { href: '#portfolio', label: 'Portfolio' }, items[items.length - 1]];
    }
    return items;
  })();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rani-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = stored === 'dark' || stored === 'light' ? stored : (prefersDark ? 'dark' : 'light');
      setTheme(initial);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(initial);
    } catch {}
  }, []);

  // Highlight the nav link that matches the current scroll target so users
  // know which section they're reading without having to scroll back up.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter((el): el is Element => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveHref(`#${visible.target.id}`);
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [navItems]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(next);
      document.documentElement.style.colorScheme = next;
      localStorage.setItem('rani-theme', next);
    } catch {}
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const top = (target as HTMLElement).getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
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
        <a
          href="/"
          aria-label="Rani Andriani Tunggal — Home"
          className="flex items-center gap-1.5 group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg-primary font-bold text-xs transition-transform group-hover:scale-110 group-hover:rotate-3 overflow-hidden shrink-0">
            {_avatarInitials || 'RT'}
          </div>
          <span className="hidden sm:inline font-display font-semibold text-sm text-text-primary">
            Rani<span className="text-accent">.</span>
          </span>
        </a>

        <div className="hidden lg:flex items-center p-0.5 rounded-full border border-border bg-bg-secondary/40 backdrop-blur-sm flex-1 justify-center max-w-2xl mx-2">
          {navItems.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap',
                  isActive
                    ? 'text-bg-primary'
                    : 'text-text-secondary hover:text-accent'
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-accent -z-10"
                  />
                )}
                <span className="relative">{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
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
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden w-8 h-8 rounded-lg glass flex items-center justify-center"
          >
            {mobileOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden glass border-t border-border mt-2">
          <div className="container mx-auto px-3 py-2 flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = activeHref === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2',
                    isActive
                      ? 'bg-accent text-bg-primary'
                      : 'text-text-secondary hover:text-accent hover:bg-accent-soft'
                  )}
                >
                  {isActive && <span aria-hidden className="w-1 h-3 rounded-full bg-bg-primary" />}
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
