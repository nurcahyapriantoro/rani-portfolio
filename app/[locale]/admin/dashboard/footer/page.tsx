import { setRequestLocale } from 'next-intl/server';
import { getFooter } from '@/lib/content';
import FooterEditor from '@/components/admin/footer-editor';

export default async function FooterPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [en, id] = await Promise.all([getFooter('en'), getFooter('id')]);

  return <FooterEditor locale={locale} enFooter={en} idFooter={id} />;
}