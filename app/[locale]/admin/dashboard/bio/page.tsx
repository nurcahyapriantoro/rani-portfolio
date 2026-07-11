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

  const [enBio, idBio] = await Promise.all([getBio('en'), getBio('id')]);

  return <BioEditor locale={locale} enBio={enBio} idBio={idBio} />;
}