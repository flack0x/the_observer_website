'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Bookmark, History, Settings, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';

interface SidebarProps {
  locale: string;
}

export default function UserSidebar({ locale }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const isAdmin = profile?.role === 'admin';

  const navigation = [
    { name: 'Overview', href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { name: 'Bookmarks', href: `/${locale}/dashboard/bookmarks`, icon: Bookmark },
    { name: 'History', href: `/${locale}/dashboard/history`, icon: History },
    // { name: 'Settings', href: `/${locale}/dashboard/settings`, icon: Settings },
  ];

  return (
    <div className="hidden lg:flex flex-col w-64 border-r border-midnight-700 bg-midnight-800 min-h-[calc(100vh-4rem)]">
      {/* User Info */}
      <div className="p-6 border-b border-midnight-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-tactical-red/10 flex items-center justify-center text-tactical-red">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-light truncate">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-slate-medium truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-tactical-red/10 text-tactical-red'
                  : 'text-slate-medium hover:bg-midnight-700 hover:text-slate-light'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {/* Admin Panel Link - only for admins */}
        {isAdmin && (
          <>
            <div className="my-3 border-t border-midnight-700" />
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors bg-tactical-red/5 text-tactical-red hover:bg-tactical-red/15 border border-tactical-red/20"
            >
              <Shield className="h-5 w-5" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-midnight-700">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-slate-medium hover:bg-midnight-700 hover:text-slate-light rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
