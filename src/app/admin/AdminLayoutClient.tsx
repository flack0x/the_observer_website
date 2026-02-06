'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, RequireAuth, useAuth } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/layout';
import { useTheme } from '@/lib/theme';
import { Globe, Sun, Moon, LogOut, User, Menu, Send, LayoutDashboard, Bookmark, Shield } from 'lucide-react';
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

// Admin Header that matches main site header EXACTLY
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
            <div className="hidden lg:flex items-center">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href) || (item.href === '/en/dashboard' && pathname === '/admin');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative inline-flex items-center h-9 px-2.5 font-heading text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors ${
                      isActive
                        ? 'text-tactical-red'
                        : 'text-slate-medium hover:text-tactical-red'
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-1 left-2.5 right-2.5 h-0.5 bg-tactical-red rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-midnight-500 text-slate-medium transition-all hover:border-tactical-red hover:text-tactical-red"
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Language Toggle */}
              <Link
                href="/ar"
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-midnight-500 px-2.5 py-1 font-heading text-[10px] font-medium uppercase tracking-wider text-slate-medium transition-all hover:border-tactical-red hover:text-tactical-red"
              >
                <Globe className="h-3 w-3" />
                AR
              </Link>

              {/* Profile Button */}
              {user && (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex items-center gap-1.5 rounded-full border px-1.5 pr-3 py-1 font-heading text-[10px] font-medium uppercase tracking-wider transition-all group ${
                      profileMenuOpen
                        ? 'border-tactical-red text-tactical-red'
                        : 'border-midnight-500 text-slate-medium hover:border-tactical-red hover:text-tactical-red'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      profileMenuOpen ? 'bg-tactical-red text-white' : 'bg-midnight-700 text-slate-light group-hover:bg-tactical-red group-hover:text-white'
                    }`}>
                      <User className="h-3 w-3" />
                    </div>
                    <span className="max-w-[100px] truncate">
                      {user.user_metadata?.full_name || 'Admin User'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 mt-2 w-56 rounded-xl border border-midnight-600 bg-midnight-800 shadow-xl z-50 overflow-hidden"
                        >
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-midnight-700">
                            <p className="text-sm font-bold text-slate-light truncate">
                              {user.user_metadata?.full_name || 'Admin User'}
                            </p>
                            <p className="text-xs text-slate-dark truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>

                          {/* Links */}
                          <div className="py-1">
                            <Link
                              href="/en/dashboard"
                              className="flex items-center gap-2 px-4 py-2 text-xs font-heading font-medium uppercase tracking-wider text-slate-medium hover:bg-midnight-700 hover:text-tactical-red transition-colors"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              Dashboard
                            </Link>
                            <Link
                              href="/en/dashboard/bookmarks"
                              className="flex items-center gap-2 px-4 py-2 text-xs font-heading font-medium uppercase tracking-wider text-slate-medium hover:bg-midnight-700 hover:text-tactical-red transition-colors"
                              onClick={() => setProfileMenuOpen(false)}
                            >
                              <Bookmark className="h-4 w-4" />
                              Bookmarks
                            </Link>
                            {profile?.role === 'admin' && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2 text-xs font-heading font-medium uppercase tracking-wider text-tactical-red hover:bg-midnight-700 transition-colors"
                                onClick={() => setProfileMenuOpen(false)}
                              >
                                <Shield className="h-4 w-4" />
                                Admin Panel
                              </Link>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="border-t border-midnight-700 py-1">
                            <button
                              onClick={() => {
                                signOut();
                                setProfileMenuOpen(false);
                                router.push('/en/login');
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-xs font-heading font-medium uppercase tracking-wider text-slate-medium hover:bg-midnight-700 hover:text-tactical-red transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Telegram CTA */}
              <a
                href="https://t.me/TheObserverEN"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 rounded-full bg-tactical-red px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover"
              >
                <Send className="h-3 w-3" />
                Join Intel
              </a>
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
