import { setRequestLocale } from 'next-intl/server';
import { getAwards } from '@/lib/content';
import AwardsEditor from '@/components/admin/awards-editor';

export default async function AwardsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const en = await getAwards('en');

  return <AwardsEditor locale={locale} enAwards={en} />;
}