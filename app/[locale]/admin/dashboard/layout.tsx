import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/navigation';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  BookOpen,
  Trophy,
  Mail,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { logoutAction } from '@/lib/actions';
import { routing } from '@/lib/routing';

export default async function AdminDashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sections = [
    { href: `/${locale}/admin/dashboard`, label: 'Overview', icon: LayoutDashboard },
    { href: `/${locale}/admin/dashboard/profile`, label: 'Profile', icon: User },
    { href: `/${locale}/admin/dashboard/experiences`, label: 'Experiences', icon: Briefcase },
    { href: `/${locale}/admin/dashboard/skills`, label: 'Skills', icon: Wrench },
    { href: `/${locale}/admin/dashboard/publications`, label: 'Publications', icon: BookOpen },
    { href: `/${locale}/admin/dashboard/awards`, label: 'Awards', icon: Trophy }
  ];

  return (
    <div className="min-h-screen flex bg-bg-primary">
      <aside className="w-64 border-r border-border p-6 flex flex-col">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-bg-primary font-bold">
            RT
          </div>
          <div>
            <p className="font-display font-semibold text-sm">Admin Panel</p>
            <p className="text-xs text-text-muted">Portfolio CMS</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-1">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-bg-secondary transition-colors"
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border pt-4 mt-4 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-bg-secondary transition-colors text-text-muted"
          >
            <ExternalLink className="w-4 h-4" />
            View Site
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-red-500/10 text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}