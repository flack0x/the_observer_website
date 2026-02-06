'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthProvider, RequireAuth, useAuth } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/layout';
import { useTheme } from '@/lib/theme';
import { Globe, Sun, Moon, LogOut, User, Menu } from 'lucide-react';
import BreakingNewsTicker from '@/components/ui/BreakingNewsTicker';

// English dictionary for admin header
const dict = {
  nav: {
    frontline: 'Frontline',
    situationRoom: 'Situation Room',
    books: 'Library',
    voices: 'Voices',
    dossier: 'Dossier',
    chronicles: 'Chronicles',
    joinIntel: 'Join Intel',
    about: 'About',
  },
  header: {
    title: 'THE OBSERVER',
    subtitle: 'Intelligence & Analysis',
    live: 'Live',
  },
  common: {} as any,
  home: {} as any,
  footer: {} as any,
  about: {} as any,
  books: {} as any,
  article: {} as any,
  dossier: {} as any,
  situationRoom: {} as any,
  auth: {} as any,
  dashboard: {} as any,
} as any;

// Admin Header that matches main site header
function AdminSiteHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [breakingNews, setBreakingNews] = useState<string[]>([]);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Fetch breaking news
  useEffect(() => {
    fetch('/api/breaking-news?locale=en')
      .then(res => res.json())
      .then(data => setBreakingNews(data.news || []))
      .catch(() => {});
  }, []);

  const navigation = [
    { name: 'Frontline', href: '/en/frontline' },
    { name: 'Situation Room', href: '/en/situation-room' },
    { name: 'Library', href: '/en/books' },
    { name: 'Voices', href: '/en/voices' },
    { name: 'Dossier', href: '/en/dossier' },
    { name: 'Chronicles', href: '/en/chronicles' },
    { name: 'About', href: '/en/about' },
    { name: 'Dashboard', href: '/en/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <BreakingNewsTicker locale="en" dict={dict} initialNews={breakingNews} />
      )}

      {/* Main Header */}
      <div className="bg-midnight-800 backdrop-blur-md border-b border-midnight-600">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-midnight-700 text-slate-medium hover:text-slate-light transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href="/en" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 sm:-my-4 flex-shrink-0">
                <Image
                  src="/images/observer-silhouette.png"
                  alt="The Observer"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading text-base sm:text-xl font-bold uppercase tracking-wider text-slate-light whitespace-nowrap">
                  The Observer
                </span>
                <span className="hidden sm:block text-[10px] sm:text-xs text-slate-medium uppercase tracking-widest truncate">
                  Intelligence & Analysis
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-heading font-medium uppercase tracking-wider transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-tactical-red'
                        : 'text-slate-medium hover:text-slate-light'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium hover:text-slate-light transition-colors"
              >
                {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Language Switch */}
              <Link
                href="/ar"
                className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium hover:text-slate-light transition-colors flex items-center gap-1.5"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-medium">AR</span>
              </Link>

              {/* User Menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-midnight-700 transition-colors border border-midnight-600"
                  >
                    <User className="h-4 w-4 text-slate-medium" />
                    <span className="text-sm font-medium text-slate-light hidden sm:inline">
                      {profile?.full_name?.split(' ')[0] || 'Admin'}
                    </span>
                  </button>

                  {profileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-midnight-800 border border-midnight-700 rounded-xl shadow-lg py-2 z-50">
                        <div className="px-4 py-2 border-b border-midnight-700">
                          <p className="text-sm font-medium text-slate-light truncate">
                            {profile?.full_name || profile?.email}
                          </p>
                          <p className="text-xs text-slate-dark">{profile?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-tactical-red/10 text-tactical-red capitalize">
                            {profile?.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => { setProfileMenuOpen(false); router.push('/admin/settings'); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-medium hover:text-slate-light hover:bg-midnight-700"
                          >
                            <User className="h-4 w-4" />
                            Profile Settings
                          </button>
                          <button
                            onClick={() => { signOut(); router.push('/admin/login'); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-midnight-700"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show layout chrome on login/signup pages
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/signup';

  if (isAuthPage) {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <RequireAuth>
        <div className="min-h-screen bg-midnight-900">
          {/* Main Site Header */}
          <AdminSiteHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

          <div className="flex">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block">
              <AdminSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </div>

            {/* Mobile sidebar overlay */}
            {mobileMenuOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black/50 z-30"
                onClick={() => setMobileMenuOpen(false)}
              />
            )}

            {/* Sidebar - Mobile */}
            <div
              className={`
                lg:hidden fixed inset-y-0 left-0 z-40 transform transition-transform duration-300
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
              `}
            >
              <AdminSidebar
                collapsed={false}
                isMobile={true}
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>

            {/* Main content area */}
            <div
              className={`
                flex-1 transition-all duration-300
                ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
              `}
            >
              {/* Page content */}
              <main className="p-4 lg:p-6">
                {children}
              </main>
            </div>
          </div>
        </div>
      </RequireAuth>
    </AuthProvider>
  );
}
