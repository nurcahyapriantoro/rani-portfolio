import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { ThemeProvider } from '@/components/theme-provider';
import { SmoothScrollProvider } from '@/components/effects/smooth-scroll';
import { Navbar } from '@/components/ui/navbar';
import { getProfile } from '@/lib/content';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap'
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap'
});

const themeInitScript = `
(function() {
  try {
    var storageKey = 'rani-theme';
    var stored = localStorage.getItem(storageKey);
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    var root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
    root.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL('https://raniandriani.vercel.app'),
  title: 'Rani Andriani Tunggal — Biochemistry Student',
  description:
    'Final-Year Biochemistry Student at IPB University specializing in Biomolecular Division. Portfolio, research, and experiences.',
  keywords: ['Biochemistry', 'IPB University', 'Biomolecular', 'Portfolio', 'Research'],
  authors: [{ name: 'Rani Andriani Tunggal' }],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Rani Andriani Tunggal',
    description: 'Final-Year Biochemistry Student at IPB University · Biomolecular Division',
    type: 'website',
    url: 'https://raniandriani.vercel.app',
    siteName: 'Rani Andriani Tunggal Portfolio',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Rani Andriani Tunggal' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rani Andriani Tunggal',
    description: 'Final-Year Biochemistry Student at IPB University',
    images: ['/og-image.svg']
  }
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile('en');

  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="rani-theme">
          <SmoothScrollProvider>
            <Navbar
              photoUrl={profile.photoUrl || undefined}
              avatarInitials={profile.avatarInitials || 'RT'}
              showCv={Boolean(profile.cvUrl)}
            />
            {children}
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
