'use client';

import { useAuth } from './context';
import { UserRole, canEditArticles, canDeleteArticles, canManageUsers } from '@/lib/admin/types';

// Get current user
export function useUser() {
  const { user, profile, isLoading } = useAuth();
  return { user, profile, isLoading };
}

// Get current user's role
export function useRole(): { role: UserRole | null; isLoading: boolean } {
  const { profile, isLoading } = useAuth();
  return {
    role: profile?.role || null,
    isLoading,
  };
}

// Check if user has a specific role
export function useHasRole(requiredRole: UserRole): boolean {
  const { role } = useRole();

  if (!role) return false;

  // Admin has access to everything
  if (role === 'admin') return true;

  // Editor has access to editor and viewer roles
  if (role === 'editor' && (requiredRole === 'editor' || requiredRole === 'viewer')) {
    return true;
  }

  // Viewer only has viewer access
  return role === requiredRole;
}

// Check if user can edit articles
export function useCanEditArticles(): boolean {
  const { role } = useRole();
  return role ? canEditArticles(role) : false;
}

// Check if user can delete articles
export function useCanDeleteArticles(): boolean {
  const { role } = useRole();
  return role ? canDeleteArticles(role) : false;
}

// Check if user can manage users
export function useCanManageUsers(): boolean {
  const { role } = useRole();
  return role ? canManageUsers(role) : false;
}

// Require authentication - returns redirect path if not authenticated
export function useRequireAuth(): { isAuthenticated: boolean; isLoading: boolean } {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}

// Require specific role - returns true if user has required role
export function useRequireRole(requiredRole: UserRole): {
  hasAccess: boolean;
  isLoading: boolean;
} {
  const { profile, isLoading } = useAuth();
  const hasRole = useHasRole(requiredRole);

  return {
    hasAccess: !!profile && hasRole,
    isLoading,
  };
}
