import { setRequestLocale } from 'next-intl/server';
import { getCertifications } from '@/lib/content';
import CertificationsEditor from '@/components/admin/certifications-editor';

export default async function CertificationsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [en, id] = await Promise.all([getCertifications('en'), getCertifications('id')]);

  return <CertificationsEditor locale={locale} enCertifications={en} idCertifications={id} />;
}