import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/navigation';
import {
  User,
  Briefcase,
  Wrench,
  BookOpen,
  Trophy,
  GraduationCap,
  Award,
  Heart,
  FolderKanban,
  FileText
} from 'lucide-react';
import { readContent } from '@/lib/content-store';

export default async function AdminOverviewPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = (await readContent(locale as 'en' | 'id')) as Record<string, unknown>;
  const arr = (key: string): unknown[] =>
    Array.isArray(content[key]) ? (content[key] as unknown[]) : [];

  const stats = [
    { label: 'Experiences', value: arr('experiences').length, icon: Briefcase, color: 'text-blue-500' },
    { label: 'Skills', value: arr('skills').length, icon: Wrench, color: 'text-purple-500' },
    { label: 'Publications', value: arr('publications').length, icon: BookOpen, color: 'text-pink-500' },
    { label: 'Awards', value: arr('awards').length, icon: Trophy, color: 'text-yellow-500' },
    { label: 'Certifications', value: arr('certifications').length, icon: Award, color: 'text-emerald-500' },
    { label: 'Volunteering', value: arr('volunteering').length, icon: Heart, color: 'text-rose-500' }
  ];

  const quickLinks = [
    { href: `/${locale}/admin/dashboard/profile`, label: 'Edit Profile', icon: User },
    { href: `/${locale}/admin/dashboard/hero`, label: 'Edit Hero', icon: GraduationCap },
    { href: `/${locale}/admin/dashboard/bio`, label: 'Edit Bio', icon: FileText },
    { href: `/${locale}/admin/dashboard/education`, label: 'Manage Education', icon: GraduationCap },
    { href: `/${locale}/admin/dashboard/experiences`, label: 'Manage Experiences', icon: Briefcase },
    { href: `/${locale}/admin/dashboard/skills`, label: 'Manage Skills', icon: Wrench },
    { href: `/${locale}/admin/dashboard/projects`, label: 'Manage Projects', icon: FolderKanban },
    { href: `/${locale}/admin/dashboard/publications`, label: 'Manage Publications', icon: BookOpen },
    { href: `/${locale}/admin/dashboard/awards`, label: 'Manage Awards', icon: Trophy },
    { href: `/${locale}/admin/dashboard/certifications`, label: 'Manage Certifications', icon: Award },
    { href: `/${locale}/admin/dashboard/volunteering`, label: 'Manage Volunteering', icon: Heart },
    { href: `/${locale}/admin/dashboard/footer`, label: 'Edit Footer', icon: FileText }
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-2">Welcome back, Admin</h1>
      <p className="text-text-muted mb-8">
        Manage your portfolio content. All changes are saved to{' '}
        <code className="px-2 py-1 rounded bg-bg-tertiary text-xs">content/{locale}.json</code>
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-2xl glass">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <div className="text-3xl font-display font-bold mb-1">{stat.value}</div>
            <div className="text-xs uppercase tracking-widest text-text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group p-4 rounded-xl glass hover:scale-[1.02] transition-all shine flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <link.icon className="w-5 h-5 text-accent" />
              <span className="font-medium text-sm">{link.label}</span>
            </div>
            <span className="text-text-muted group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl glass border border-accent/30 bg-accent-soft">
        <div className="flex items-start gap-3">
          <GraduationCap className="w-5 h-5 text-accent mt-0.5" />
          <div>
            <p className="font-semibold mb-1">About this admin</p>
            <p className="text-sm text-text-muted leading-relaxed">
              This panel uses Server Actions to write directly to the JSON content files.
              On Vercel, the filesystem is read-only at runtime, so this works during{' '}
              <code className="px-1.5 py-0.5 rounded bg-bg-tertiary text-xs">npm run dev</code>{' '}
              and rebuilds on Vercel. For production editing without redeploy, consider Vercel KV or Postgres.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}