'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useAuth, ShowForAdmin } from '@/lib/auth';
import { CATEGORIES } from '@/lib/categories';

interface Article {
  id: number;
  telegram_id: string;
  channel: 'en' | 'ar';
  title: string;
  category: string;
  status: string;
  telegram_date: string;
  image_url: string | null;
}

interface ArticlesResponse {
  data: Article[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [channelFilter, setChannelFilter] = useState(searchParams.get('channel') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');

  // Action menu
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (channelFilter && channelFilter !== 'all') params.set('channel', channelFilter);
      if (categoryFilter) params.set('category', categoryFilter);

      const response = await fetch(`/api/admin/articles?${params}`);
      const data: ArticlesResponse = await response.json();

      if (response.ok) {
        setArticles(data.data);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, channelFilter, categoryFilter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Handle search with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = async (telegramId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(telegramId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchArticles();
      } else {
        alert('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }

    setActiveMenu(null);
  };

  const totalPages = Math.ceil(total / pageSize);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-earth-olive/10 text-earth-olive';
      case 'draft':
        return 'bg-tactical-amber/10 text-tactical-amber';
      case 'archived':
        return 'bg-slate-dark/10 text-slate-dark';
      default:
        return 'bg-slate-dark/10 text-slate-dark';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
            Articles
          </h1>
          <p className="text-slate-medium mt-1">
            {total} total articles
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 bg-tactical-red text-white font-heading font-bold uppercase tracking-wider
                   px-4 py-2.5 rounded-lg hover:bg-tactical-red-hover transition-colors text-sm w-fit"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-dark" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-midnight-700 border border-midnight-500 rounded-lg pl-10 pr-4 py-2.5
                         text-slate-light placeholder:text-slate-dark text-sm
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
              />
            </div>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-2.5
                     text-slate-light text-sm
                     focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Channel filter */}
          <select
            value={channelFilter}
            onChange={(e) => {
              setChannelFilter(e.target.value);
              setPage(1);
            }}
            className="bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-2.5
                     text-slate-light text-sm
                     focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-2.5
                     text-slate-light text-sm
                     focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
          >
            <option value="">All Categories</option>
            {Object.values(CATEGORIES).filter(c => c !== 'All').map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles table */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-tactical-red" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-slate-dark">
            <p>No articles found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-midnight-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Channel
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-700">
                {articles.map((article) => (
                  <motion.tr
                    key={article.telegram_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-midnight-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/articles/${encodeURIComponent(article.telegram_id)}`}
                        className="text-slate-light hover:text-tactical-red transition-colors font-medium line-clamp-1"
                      >
                        {article.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs uppercase text-slate-medium">
                        {article.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-medium">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(article.status)}`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-dark">
                      {new Date(article.telegram_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActiveMenu(activeMenu === article.telegram_id ? null : article.telegram_id)}
                          className="p-1.5 rounded-lg hover:bg-midnight-700 text-slate-dark hover:text-slate-medium transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {activeMenu === article.telegram_id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-midnight-800 border border-midnight-700 rounded-lg shadow-lg py-1 z-10">
                            <Link
                              href={`/admin/articles/${encodeURIComponent(article.telegram_id)}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-medium hover:text-slate-light hover:bg-midnight-700 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </Link>
                            <Link
                              href={`/${article.channel}/frontline/${article.telegram_id}`}
                              target="_blank"
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-medium hover:text-slate-light hover:bg-midnight-700 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View on Site
                            </Link>
                            <ShowForAdmin>
                              <button
                                onClick={() => handleDelete(article.telegram_id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-midnight-700 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </ShowForAdmin>
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-midnight-700">
            <p className="text-sm text-slate-dark">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-slate-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}
