'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  LogOut,
  User,
  ExternalLink,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

// Breadcrumb mapping
const breadcrumbLabels: Record<string, string> = {
  admin: 'Dashboard',
  articles: 'Articles',
  new: 'New Article',
  media: 'Media Library',
  users: 'User Management',
  settings: 'Settings',
};

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => {
      const href = '/' + array.slice(0, index + 1).join('/');
      const label = breadcrumbLabels[segment] || segment;
      const isLast = index === array.length - 1;

      return { href, label, isLast };
    });

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return (
    <header className="h-16 bg-midnight-800 border-b border-midnight-700 flex items-center justify-between px-4 lg:px-6">
      {/* Left side - Menu button (mobile) and Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-midnight-700 text-slate-medium hover:text-slate-light transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-4 w-4 text-slate-dark" />}
              {crumb.isLast ? (
                <span className="text-slate-light font-medium">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-slate-medium hover:text-slate-light transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        {/* View site link */}
        <Link
          href="/en"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                   text-slate-medium hover:text-slate-light hover:bg-midnight-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span>View Site</span>
        </Link>

        {/* Notifications (placeholder) */}
        <button className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium hover:text-slate-light transition-colors relative">
          <Bell className="h-5 w-5" />
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-midnight-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-tactical-red/20 flex items-center justify-center">
              <span className="text-sm font-bold text-tactical-red">
                {profile?.email[0].toUpperCase() || 'U'}
              </span>
            </div>
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-midnight-800 border border-midnight-700 rounded-xl shadow-lg py-2 z-50">
              {/* User info */}
              <div className="px-4 py-2 border-b border-midnight-700">
                <p className="text-sm font-medium text-slate-light truncate">
                  {profile?.full_name || profile?.email}
                </p>
                <p className="text-xs text-slate-dark">{profile?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-tactical-red/10 text-tactical-red capitalize">
                  {profile?.role}
                </span>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/admin/settings');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-medium hover:text-slate-light hover:bg-midnight-700 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-midnight-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
