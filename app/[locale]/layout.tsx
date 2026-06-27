import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';
import { SmoothScroll } from '@/components/effects/smooth-scroll';
import { Navbar } from '@/components/ui/navbar';
import { routing } from '@/lib/routing';
import '../globals.css';

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

export const metadata: Metadata = {
  title: 'Rani Andriani Tunggal — Biochemistry Student',
  description:
    'Final-Year Biochemistry Student at IPB University specializing in Biomolecular Division. Portfolio, research, and experiences.',
  keywords: ['Biochemistry', 'IPB University', 'Biomolecular', 'Portfolio', 'Research'],
  authors: [{ name: 'Rani Andriani Tunggal' }],
  openGraph: {
    title: 'Rani Andriani Tunggal',
    description: 'Final-Year Biochemistry Student at IPB University · Biomolecular Division',
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Rani Andriani Tunggal' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rani Andriani Tunggal',
    description: 'Final-Year Biochemistry Student at IPB University',
    images: ['/og-image.svg']
  }
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'en' | 'id')) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="rani-theme">
          <NextIntlClientProvider messages={messages}>
            <SmoothScroll />
            <Navbar />
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}