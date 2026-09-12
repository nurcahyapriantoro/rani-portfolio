import { setRequestLocale } from 'next-intl/server';
import { getProfile } from '@/lib/content';
import CvEditor from '@/components/admin/cv-editor';

export default async function CvPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getProfile('en');

  return <CvEditor initialCvUrl={profile.cvUrl} />;
}
