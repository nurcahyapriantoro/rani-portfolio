import { setRequestLocale } from 'next-intl/server';
import { getBio } from '@/lib/content';
import BioEditor from '@/components/admin/bio-editor';

export default async function BioPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const enBio = await getBio('en');

  return <BioEditor locale={locale} enBio={enBio} />;
}