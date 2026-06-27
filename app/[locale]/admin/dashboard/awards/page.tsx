import { setRequestLocale } from 'next-intl/server';
import { getAwards } from '@/lib/content';
import AwardsEditor from '@/components/admin/awards-editor';

export default async function AwardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const awards = await getAwards(locale as 'en' | 'id');
  return <AwardsEditor locale={locale} awards={awards} />;
}