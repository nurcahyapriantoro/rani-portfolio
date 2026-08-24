import { setRequestLocale } from 'next-intl/server';
import { getProfile } from '@/lib/content';
import ProfileEditor from '@/components/admin/profile-editor';

export default async function ProfilePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const enProfile = await getProfile('en');

  return <ProfileEditor locale={locale} enProfile={enProfile} />;
}