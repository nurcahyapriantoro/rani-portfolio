'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  photoUrl?: string;
  avatarInitials: string;
  showCv?: boolean;
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

export function Navbar({ photoUrl: _photoUrl, avatarInitials: _avatarInitials, showCv = false }: NavbarProps) {
  const navItems = showCv
    ? [...NAV_ITEMS.slice(0, -1), { href: '#cv', label: 'CV' }, NAV_ITEMS[NAV_ITEMS.length - 1]]
    : NAV_ITEMS;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
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
          className="flex items-center gap-1.5 group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-bg-primary font-bold text-xs transition-transform group-hover:scale-110 group-hover:rotate-3 overflow-hidden shrink-0">
            {_avatarInitials || 'RT'}
          </div>
          <span className="hidden sm:inline font-display font-semibold text-sm text-text-primary">
            Rani<span className="text-accent">.</span>
          </span>
        </a>

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
          <button
            onClick={toggleTheme}
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
