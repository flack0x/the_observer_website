'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context';
import { UserRole } from '@/lib/admin/types';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface RoleGuardProps extends AuthGuardProps {
  requiredRole: UserRole;
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-tactical-red" />
        <p className="text-slate-medium text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Require authentication
export function RequireAuth({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return fallback || <LoadingSpinner />;
  }

  return <>{children}</>;
}

// Require specific role
export function RequireRole({ children, requiredRole, fallback }: RoleGuardProps) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const router = useRouter();

  const hasAccess = () => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    if (profile.role === 'editor' && (requiredRole === 'editor' || requiredRole === 'viewer')) {
      return true;
    }
    return profile.role === requiredRole;
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/admin/login');
      } else if (!hasAccess()) {
        router.push('/admin');
      }
    }
  }, [isAuthenticated, isLoading, profile, router]);

  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAuthenticated || !hasAccess()) {
    return fallback || <LoadingSpinner />;
  }

  return <>{children}</>;
}

// Admin only guard
export function RequireAdmin({ children, fallback }: AuthGuardProps) {
  return (
    <RequireRole requiredRole="admin" fallback={fallback}>
      {children}
    </RequireRole>
  );
}

// Editor or Admin guard
export function RequireEditor({ children, fallback }: AuthGuardProps) {
  return (
    <RequireRole requiredRole="editor" fallback={fallback}>
      {children}
    </RequireRole>
  );
}

// Component to show/hide based on role (doesn't redirect)
interface ShowForRoleProps {
  role: UserRole;
  children: React.ReactNode;
}

export function ShowForRole({ role, children }: ShowForRoleProps) {
  const { profile } = useAuth();

  if (!profile) return null;

  // Admin sees everything
  if (profile.role === 'admin') return <>{children}</>;

  // Editor sees editor and viewer content
  if (profile.role === 'editor' && (role === 'editor' || role === 'viewer')) {
    return <>{children}</>;
  }

  // Exact match
  if (profile.role === role) return <>{children}</>;

  return null;
}

// Show only for admins
export function ShowForAdmin({ children }: { children: React.ReactNode }) {
  return <ShowForRole role="admin">{children}</ShowForRole>;
}

// Show for editors and admins
export function ShowForEditor({ children }: { children: React.ReactNode }) {
  return <ShowForRole role="editor">{children}</ShowForRole>;
}
