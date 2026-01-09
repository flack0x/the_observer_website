// Admin System Types

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface Article {
  id: number;
  telegram_id: string;
  channel: 'en' | 'ar';
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  countries: string[];
  organizations: string[];
  is_structured: boolean;
  telegram_link: string;
  telegram_date: string;
  image_url: string | null;
  video_url: string | null;
  author_id: string | null;
  status: ArticleStatus;
  published_at: string | null;
  last_edited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleRevision {
  id: string;
  article_id: number;
  title: string | null;
  content: string | null;
  edited_by: string | null;
  created_at: string;
}

// Form types for article editing
export interface ArticleFormData {
  title_en: string;
  title_ar: string;
  excerpt_en: string;
  excerpt_ar: string;
  content_en: string;
  content_ar: string;
  category: string;
  countries: string[];
  organizations: string[];
  image_url: string;
  video_url: string;
  status: ArticleStatus;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Permission helpers
export const ROLE_PERMISSIONS = {
  admin: ['read', 'create', 'edit', 'delete', 'publish', 'manage_users'],
  editor: ['read', 'create', 'edit', 'publish'],
  viewer: ['read'],
} as const;

export type Permission = (typeof ROLE_PERMISSIONS)[UserRole][number];

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return (ROLE_PERMISSIONS[role] as readonly string[]).includes(permission);
}

export function canManageUsers(role: UserRole): boolean {
  return role === 'admin';
}

export function canEditArticles(role: UserRole): boolean {
  return role === 'admin' || role === 'editor';
}

export function canDeleteArticles(role: UserRole): boolean {
  return role === 'admin';
}
