'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Lenis from 'lenis';

type LenisContextType = {
  scrollTo: (target: string | number, options?: { offset?: number; duration?: number }) => void;
  scrollToTop: () => void;
};

const LenisContext = createContext<LenisContextType | null>(null);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    setLenisInstance(lenis);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  const scrollTo = useCallback(
    (target: string | number, options?: { offset?: number; duration?: number }) => {
      if (!lenisInstance) {
        const el = typeof target === 'string' ? document.querySelector(target) : null;
        if (el) {
          (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        }
        return;
      }
      lenisInstance.scrollTo(target, options);
    },
    [lenisInstance]
  );

  const scrollToTop = useCallback(() => {
    scrollTo(0, { duration: 1.5 });
  }, [scrollTo]);

  return (
    <LenisContext.Provider value={{ scrollTo, scrollToTop }}>
      {children}
    </LenisContext.Provider>
  );
}

export function useSmoothScroll() {
  const ctx = useContext(LenisContext);
  if (!ctx) {
    return {
      scrollTo: (target: string | number) => {
        if (typeof window === 'undefined') return;
        const el = typeof target === 'string' ? document.querySelector(target) : null;
        if (el) {
          (el as HTMLElement).scrollIntoView({ behavior: 'smooth' });
        } else if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        }
      },
      scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    };
  }
  return ctx;
}

export function SmoothScroll() {
  return null;
}