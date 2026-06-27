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
    scrollTo(href, { offset: -80, duration: 1.2 });
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', href);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass shadow-sm py-3' : 'py-5'
      )}
    >
      <nav className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault();
              scrollTo(0, { duration: 1.5 });
            }
          }}
          className="flex items-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-bg-primary font-bold text-lg transition-transform group-hover:scale-110 group-hover:rotate-3">
            RT
          </div>
          <span className="hidden sm:inline font-display font-semibold text-text-primary">
            Rani<span className="text-accent">.</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-accent transition-colors relative group"
            >
              {item.label}
              <span className="absolute bottom-1 left-3 right-3 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:scale-110 transition-transform"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-text-primary" />
            ) : (
              <Sun className="w-4 h-4 text-accent" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="lg:hidden w-10 h-10 rounded-xl glass flex items-center justify-center"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden glass border-t border-border mt-3">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-accent transition-colors"
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