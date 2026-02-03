'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Image,
  Users,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Activity,
  Calendar,
} from 'lucide-react';
import { useAuth, ShowForAdmin } from '@/lib/auth';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Articles', href: '/admin/articles', icon: FileText },
  { label: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { label: 'Books', href: '/admin/books', icon: BookOpen },
  { label: 'Media', href: '/admin/media', icon: Image },
  { label: 'Activity', href: '/admin/activity', icon: Activity },
  { label: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
  { label: 'Settings', href: '/admin/settings', icon: Settings, adminOnly: true },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void; // For mobile - closes the sidebar
  isMobile?: boolean;
}

export function AdminSidebar({ collapsed = false, onToggle, onClose, isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        ${isMobile ? 'relative' : 'fixed left-0 top-0'} h-screen bg-midnight-800 border-r border-midnight-700
        flex flex-col transition-all duration-300 z-40
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-midnight-700">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2" onClick={isMobile ? onClose : undefined}>
            <Shield className="h-6 w-6 text-tactical-red" />
            <span className="font-heading font-bold uppercase tracking-wider text-slate-light">
              Admin
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" className="mx-auto">
            <Shield className="h-6 w-6 text-tactical-red" />
          </Link>
        )}
        {/* Mobile close button */}
        {isMobile && onClose && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-lg bg-midnight-700 hover:bg-midnight-600 text-slate-light transition-colors z-50"
          >
            <X className="h-6 w-6" />
          </button>
        )}
        {/* Desktop collapse button */}
        {!isMobile && onToggle && !collapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-midnight-700 text-slate-dark hover:text-slate-medium transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* User info - at top */}
      {profile && (
        <div className="p-4 border-b border-midnight-700">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-tactical-red/20 flex items-center justify-center">
                <span className="text-sm font-bold text-tactical-red">
                  {profile.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-light truncate">
                  {profile.full_name || profile.email}
                </p>
                <p className="text-xs text-slate-dark capitalize">{profile.role}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-tactical-red/20 flex items-center justify-center">
                <span className="text-sm font-bold text-tactical-red">
                  {profile.email[0].toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            // Skip admin-only items for non-admins
            if (item.adminOnly) {
              return (
                <ShowForAdmin key={item.href}>
                  <NavItemComponent
                    item={item}
                    isActive={isActive(item.href)}
                    collapsed={collapsed}
                    onClose={isMobile ? onClose : undefined}
                  />
                </ShowForAdmin>
              );
            }

            return (
              <NavItemComponent
                key={item.href}
                item={item}
                isActive={isActive(item.href)}
                collapsed={collapsed}
                onClose={isMobile ? onClose : undefined}
              />
            );
          })}
        </ul>
      </nav>

      {/* Sign Out Button */}
      <div className={`border-t border-midnight-700 ${collapsed ? 'p-2' : 'p-4'}`}>
        <button
          onClick={() => signOut()}
          className={`
            flex items-center gap-3 w-full rounded-lg transition-colors text-slate-medium hover:bg-midnight-700 hover:text-slate-light
            ${collapsed ? 'justify-center p-2' : 'px-3 py-2.5'}
          `}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && onToggle && (
        <button
          onClick={onToggle}
          className="p-3 border-t border-midnight-700 hover:bg-midnight-700 text-slate-dark hover:text-slate-medium transition-colors"
        >
          <ChevronRight className="h-4 w-4 mx-auto" />
        </button>
      )}
    </aside>
  );
}

// Navigation item component
function NavItemComponent({
  item,
  isActive,
  collapsed,
  onClose,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClose?: () => void;
}) {
  const Icon = item.icon;

  const handleClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <li>
      <Link
        href={item.href}
        onClick={handleClick}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
          ${collapsed ? 'justify-center' : ''}
          ${
            isActive
              ? 'bg-tactical-red/10 text-tactical-red border-l-2 border-tactical-red'
              : 'text-slate-medium hover:bg-midnight-700 hover:text-slate-light'
          }
        `}
        title={collapsed ? item.label : undefined}
      >
        <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-tactical-red' : ''}`} />
        {!collapsed && (
          <span className="font-medium text-sm">{item.label}</span>
        )}
      </Link>
    </li>
  );
}
