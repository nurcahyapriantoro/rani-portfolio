'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (originX?: number, originY?: number) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'rani-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const current = root.classList.contains('dark') ? 'dark' : 'light';
    setThemeState(current);
    setMounted(true);
  }, []);

  const applyTheme = useCallback(
    (newTheme: Theme, originX?: number, originY?: number) => {
      if (typeof window === 'undefined') return;

      const root = window.document.documentElement;
      const prevTheme = root.classList.contains('dark') ? 'dark' : 'light';

      if (prevTheme === newTheme) return;

      const useViewTransition = typeof document !== 'undefined' && 'startViewTransition' in document;

      if (useViewTransition) {
        const transition = (document as any).startViewTransition(() => {
          root.classList.remove('light', 'dark');
          root.classList.add(newTheme);
          root.style.colorScheme = newTheme;
          root.setAttribute('data-theme', newTheme);
          localStorage.setItem(storageKey, newTheme);
        });

        transition.ready.then(() => {
          const clipPath = getRippleClipPath(originX ?? window.innerWidth / 2, originY ?? 64);
          root.animate(
            [
              { clipPath: `circle(0px at ${originX ?? window.innerWidth / 2}px ${originY ?? 64}px)` },
              { clipPath }
            ],
            {
              duration: 500,
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              pseudoElement: '::view-transition-new(root)'
            }
          );
        });

        setThemeState(newTheme);
      } else {
        const body = document.body;
        body.classList.add('theme-transitioning');

        if (originX !== undefined && originY !== undefined) {
          const ripple = document.createElement('div');
          ripple.className = 'theme-ripple';
          ripple.style.left = `${originX}px`;
          ripple.style.top = `${originY}px`;
          ripple.style.width = '50px';
          ripple.style.height = '50px';
          ripple.style.marginLeft = '-25px';
          ripple.style.marginTop = '-25px';
          ripple.style.background = newTheme === 'dark'
            ? 'radial-gradient(circle, #0a0f0d 0%, transparent 70%)'
            : 'radial-gradient(circle, #ffffff 0%, transparent 70%)';
          document.body.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        }

        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
        root.style.colorScheme = newTheme;
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem(storageKey, newTheme);

        setTimeout(() => {
          body.classList.remove('theme-transitioning');
        }, 450);

        setThemeState(newTheme);
      }
    },
    [storageKey]
  );

  const setTheme = (newTheme: Theme) => applyTheme(newTheme);

  const toggleTheme = (originX?: number, originY?: number) => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    applyTheme(next, originX, originY);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, toggleTheme }} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

function getRippleClipPath(x: number, y: number) {
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
  return `circle(${radius}px at ${x}px ${y}px)`;
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};