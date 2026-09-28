import { setRequestLocale } from 'next-intl/server';
import { getProfile } from '@/lib/content';
import PortfolioEditor from '@/components/admin/portfolio-editor';

export default async function PortfolioPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getProfile('en');

  return <PortfolioEditor initialPortfolioPdfUrl={profile.portfolioPdfUrl ?? ''} />;
}
