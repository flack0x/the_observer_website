'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, RequireAuth } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/layout';
import Header from '@/components/layout/Header';
import type { Dictionary } from '@/lib/i18n';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  breakingNews: string[];
  dict: Dictionary;
}

export default function AdminLayoutClient({
  children,
  breakingNews,
  dict,
}: AdminLayoutClientProps) {
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
          {/* Main Site Header - exact same as homepage */}
          <Header locale="en" dict={dict} breakingNews={breakingNews} />

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
