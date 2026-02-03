'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import {
  FileText,
  Image,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Eye,
  Activity,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth, ShowForAdmin } from '@/lib/auth';
import { getClient } from '@/lib/supabase/client';

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalMedia: number;
  publishedThisWeek: number;
}

interface RecentArticle {
  id: number;
  telegram_id: string;
  title: string;
  category: string;
  status: string;
  telegram_date: string;
  channel: string;
}

interface RecentActivity {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  target_title: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
    email: string;
  };
}

// Fetcher function for SWR
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const supabase = getClient();

  // Calculate date 7 days ago
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [totalResult, publishedResult, draftResult, mediaResult, publishedThisWeekResult] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.storage.from('article-media').list('', { limit: 1000 }),
    supabase.from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', weekAgo.toISOString()),
  ]);

  return {
    totalArticles: totalResult.count || 0,
    publishedArticles: publishedResult.count || 0,
    draftArticles: draftResult.count || 0,
    totalMedia: mediaResult.data?.filter((f: { name: string }) => !f.name.startsWith('.')).length || 0,
    publishedThisWeek: publishedThisWeekResult.count || 0,
  };
};

const fetchRecentArticles = async (): Promise<RecentArticle[]> => {
  const supabase = getClient();

  const { data } = await supabase
    .from('articles')
    .select('id, telegram_id, title, category, status, telegram_date, channel')
    .order('telegram_date', { ascending: false })
    .limit(5);

  return data || [];
};

const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
  const supabase = getClient();

  const { data } = await supabase
    .from('activity_log')
    .select(`
      id,
      action,
      target_type,
      target_id,
      target_title,
      created_at,
      user:user_profiles!user_id (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  return (data as RecentActivity[]) || [];
};

const fetchDraftArticles = async (): Promise<RecentArticle[]> => {
  const supabase = getClient();

  const { data } = await supabase
    .from('articles')
    .select('id, telegram_id, title, category, status, telegram_date, channel')
    .eq('status', 'draft')
    .order('telegram_date', { ascending: false })
    .limit(5);

  return data || [];
};

export default function AdminDashboardPage() {
  const { profile } = useAuth();

  // SWR with caching - data persists across page navigations
  const { data: stats, isLoading: statsLoading } = useSWR<DashboardStats>(
    'dashboard-stats',
    fetchDashboardStats,
    {
      revalidateOnFocus: false,      // Don't refetch on window focus
      revalidateOnReconnect: false,  // Don't refetch on reconnect
      dedupingInterval: 60000,       // Dedupe requests within 60 seconds
      refreshInterval: 300000,       // Auto refresh every 5 minutes
      fallbackData: {                // Show zeros while loading first time
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        totalMedia: 0,
        publishedThisWeek: 0,
      },
    }
  );

  const { data: recentArticles, isLoading: articlesLoading } = useSWR<RecentArticle[]>(
    'dashboard-recent-articles',
    fetchRecentArticles,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      refreshInterval: 300000,
      fallbackData: [],
    }
  );

  const { data: recentActivity } = useSWR<RecentActivity[]>(
    'dashboard-recent-activity',
    fetchRecentActivity,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      refreshInterval: 60000, // Refresh more often for activity
      fallbackData: [],
    }
  );

  const { data: draftArticles, mutate: mutateDrafts } = useSWR<RecentArticle[]>(
    'dashboard-draft-articles',
    fetchDraftArticles,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      refreshInterval: 300000,
      fallbackData: [],
    }
  );

  const [publishingId, setPublishingId] = useState<string | null>(null);

  const handleQuickPublish = async (telegramId: string) => {
    setPublishingId(telegramId);
    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(telegramId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });

      if (response.ok) {
        mutateDrafts();
      }
    } catch (error) {
      console.error('Error publishing article:', error);
    } finally {
      setPublishingId(null);
    }
  };

  const isLoading = statsLoading && !stats?.totalArticles;

  const statCards = [
    {
      label: 'Total Articles',
      value: stats?.totalArticles || 0,
      icon: FileText,
      color: 'tactical-red',
      href: '/admin/articles',
    },
    {
      label: 'Published This Week',
      value: stats?.publishedThisWeek || 0,
      icon: TrendingUp,
      color: 'earth-olive',
      href: '/admin/articles?status=published',
    },
    {
      label: 'Drafts',
      value: stats?.draftArticles || 0,
      icon: Clock,
      color: 'tactical-amber',
      href: '/admin/articles?status=draft',
    },
    {
      label: 'Media Files',
      value: stats?.totalMedia || 0,
      icon: Image,
      color: 'slate-medium',
      href: '/admin/media',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
            Dashboard
          </h1>
          <p className="text-slate-medium mt-1">
            Welcome back, {profile?.full_name || profile?.email}
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3">
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 bg-tactical-red text-white font-heading font-bold uppercase tracking-wider
                     px-4 py-2.5 rounded-lg hover:bg-tactical-red-hover transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            New Article
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={stat.href}
              className="block bg-midnight-800 rounded-xl border border-midnight-700 p-5 hover:border-tactical-red/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-dark text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-light mt-1">
                    {isLoading ? '-' : stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg bg-${stat.color}/10`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Two-column: Drafts Awaiting Publish + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drafts Awaiting Publish */}
        <div className="bg-midnight-800 rounded-xl border border-midnight-700">
          <div className="flex items-center justify-between p-5 border-b border-midnight-700">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light flex items-center gap-2">
              <Clock className="h-4 w-4 text-tactical-amber" />
              Drafts Awaiting Publish
            </h2>
            <Link
              href="/admin/articles?status=draft"
              className="flex items-center gap-1 text-xs text-tactical-red hover:text-tactical-amber transition-colors"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-midnight-700">
            {draftArticles && draftArticles.length > 0 ? (
              draftArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 hover:bg-midnight-700/30 transition-colors"
                >
                  <Link
                    href={`/admin/articles/${article.telegram_id}`}
                    className="min-w-0 flex-1 mr-3"
                  >
                    <p className="text-slate-light text-sm font-medium truncate">
                      {article.title}
                    </p>
                    <span className="text-xs text-slate-dark uppercase">{article.channel}</span>
                  </Link>
                  <button
                    onClick={() => handleQuickPublish(article.telegram_id)}
                    disabled={publishingId === article.telegram_id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                             bg-earth-olive/10 text-earth-olive hover:bg-earth-olive/20
                             disabled:opacity-50 transition-colors flex-shrink-0"
                  >
                    {publishingId === article.telegram_id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    Publish
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-dark">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No drafts pending</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-midnight-800 rounded-xl border border-midnight-700">
          <div className="flex items-center justify-between p-5 border-b border-midnight-700">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
              Recent Activity
            </h2>
            <Link
              href="/admin/activity"
              className="flex items-center gap-1 text-xs text-tactical-red hover:text-tactical-amber transition-colors"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-midnight-700">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const timeAgo = (() => {
                  const diffMs = Date.now() - new Date(activity.created_at).getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);
                  if (diffMins < 1) return 'just now';
                  if (diffMins < 60) return `${diffMins}m ago`;
                  if (diffHours < 24) return `${diffHours}h ago`;
                  return `${diffDays}d ago`;
                })();

                const actionLabel: Record<string, string> = {
                  create: 'created',
                  update: 'updated',
                  publish: 'published',
                  unpublish: 'unpublished',
                  delete: 'deleted',
                  upload: 'uploaded',
                  role_change: 'changed role for',
                };

                return (
                  <div key={activity.id} className="p-4 hover:bg-midnight-700/30 transition-colors">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-light font-medium">
                        {activity.user?.full_name || activity.user?.email || 'User'}
                      </span>
                      <span className="text-slate-dark">
                        {actionLabel[activity.action] || activity.action}
                      </span>
                      {activity.target_id && activity.target_type === 'article' ? (
                        <Link
                          href={`/admin/articles/${activity.target_id}`}
                          className="text-tactical-red hover:underline truncate max-w-[150px]"
                        >
                          {activity.target_title || 'article'}
                        </Link>
                      ) : (
                        <span className="text-slate-medium truncate max-w-[150px]">
                          {activity.target_title || activity.target_type}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-dark mt-1 block">{timeAgo}</span>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-dark">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent articles */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700">
        <div className="flex items-center justify-between p-5 border-b border-midnight-700">
          <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
            Recent Articles
          </h2>
          <Link
            href="/admin/articles"
            className="flex items-center gap-1 text-sm text-tactical-red hover:text-tactical-amber transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="divide-y divide-midnight-700">
          {articlesLoading && (!recentArticles || recentArticles.length === 0) ? (
            // Skeleton loading
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-midnight-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-midnight-700 rounded w-1/4" />
              </div>
            ))
          ) : recentArticles && recentArticles.length > 0 ? (
            recentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/admin/articles/${article.telegram_id}`}
                className="flex items-center justify-between p-4 hover:bg-midnight-700/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-slate-light font-medium truncate">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-dark uppercase">
                      {article.channel}
                    </span>
                    <span className="text-xs text-slate-dark">
                      {new Date(article.telegram_date).toLocaleDateString()}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        article.status === 'published'
                          ? 'bg-earth-olive/10 text-earth-olive'
                          : article.status === 'draft'
                          ? 'bg-tactical-amber/10 text-tactical-amber'
                          : 'bg-slate-dark/10 text-slate-dark'
                      }`}
                    >
                      {article.status}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-dark flex-shrink-0 ml-4" />
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-slate-dark">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No articles yet</p>
              <Link
                href="/admin/articles/new"
                className="text-tactical-red hover:text-tactical-amber text-sm mt-2 inline-block"
              >
                Create your first article
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
