import { setRequestLocale } from 'next-intl/server';
import { getHero } from '@/lib/content';
import HeroEditor from '@/components/admin/hero-editor';

export default async function HeroPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const en = await getHero('en');

  return <HeroEditor locale={locale} enHero={en} />;
}