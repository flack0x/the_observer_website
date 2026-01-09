'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Image,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Eye,
} from 'lucide-react';
import { useAuth, ShowForAdmin } from '@/lib/auth';
import { getClient } from '@/lib/supabase/client';

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalMedia: number;
}

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalMedia: 0,
  });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = getClient();

      try {
        // Fetch article counts
        const { count: totalCount } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true });

        const { count: publishedCount } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');

        const { count: draftCount } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft');

        // Fetch recent articles
        const { data: articles } = await supabase
          .from('articles')
          .select('id, telegram_id, title, category, status, telegram_date, channel')
          .order('telegram_date', { ascending: false })
          .limit(5);

        setStats({
          totalArticles: totalCount || 0,
          publishedArticles: publishedCount || 0,
          draftArticles: draftCount || 0,
          totalMedia: 0, // Would need to query storage
        });

        setRecentArticles(articles || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: 'Total Articles',
      value: stats.totalArticles,
      icon: FileText,
      color: 'tactical-red',
      href: '/admin/articles',
    },
    {
      label: 'Published',
      value: stats.publishedArticles,
      icon: Eye,
      color: 'earth-olive',
      href: '/admin/articles?status=published',
    },
    {
      label: 'Drafts',
      value: stats.draftArticles,
      icon: Clock,
      color: 'tactical-amber',
      href: '/admin/articles?status=draft',
    },
    {
      label: 'Media Files',
      value: stats.totalMedia,
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
          {isLoading ? (
            // Skeleton loading
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-midnight-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-midnight-700 rounded w-1/4" />
              </div>
            ))
          ) : recentArticles.length > 0 ? (
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

      {/* Quick tips for new users */}
      <ShowForAdmin>
        <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-5">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light mb-3">
            Quick Tips
          </h3>
          <ul className="space-y-2 text-sm text-slate-medium">
            <li className="flex items-start gap-2">
              <span className="text-tactical-red">•</span>
              Create articles in both English and Arabic using the bilingual editor
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tactical-red">•</span>
              Upload images and videos to the Media Library, or paste external URLs
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tactical-red">•</span>
              Articles start as drafts. Publish them when ready for the public site
            </li>
          </ul>
        </div>
      </ShowForAdmin>
    </div>
  );
}
