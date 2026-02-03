'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import useSWR from 'swr';
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
  CheckCircle2,
  CircleOff,
  Calendar,
  Square,
  CheckSquare,
  MinusSquare,
  Smartphone,
} from 'lucide-react';
import { useAuth, ShowForAdmin } from '@/lib/auth';
import { CATEGORIES } from '@/lib/categories';
import { QuickEditModal } from '@/components/admin/articles';

interface Article {
  id: number;
  telegram_id: string;
  channel: 'en' | 'ar';
  title: string;
  category: string;
  status: string;
  telegram_date: string;
  image_url: string | null;
  scheduled_at: string | null;
}

interface ArticlesResponse {
  data: Article[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Fetcher for SWR
const fetchArticles = async (url: string): Promise<ArticlesResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch articles');
  return response.json();
};

export default function AdminArticlesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [channelFilter, setChannelFilter] = useState(searchParams.get('channel') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');

  // Action menu
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Bulk selection
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState<string | null>(null);

  // Quick edit modal
  const [quickEditArticleId, setQuickEditArticleId] = useState<string | null>(null);

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    // Debounce the actual search
    const timeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  };

  // Build URL for SWR cache key
  const buildUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (debouncedSearch) params.set('search', debouncedSearch);
    if (statusFilter) params.set('status', statusFilter);
    if (channelFilter && channelFilter !== 'all') params.set('channel', channelFilter);
    if (categoryFilter) params.set('category', categoryFilter);

    return `/api/admin/articles?${params}`;
  }, [page, pageSize, debouncedSearch, statusFilter, channelFilter, categoryFilter]);

  // SWR with caching
  const { data, isLoading, mutate } = useSWR<ArticlesResponse>(
    buildUrl(),
    fetchArticles,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000,      // Cache for 30 seconds
      keepPreviousData: true,       // Show previous data while loading new
    }
  );

  const articles = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleDelete = async (telegramId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(telegramId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Revalidate the cache
        mutate();
      } else {
        alert('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }

    setActiveMenu(null);
  };

  const handleStatusToggle = async (telegramId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';

    setUpdatingStatus(telegramId);
    setActiveMenu(null);

    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(telegramId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        mutate();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedArticles.size === articles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(articles.map(a => a.telegram_id)));
    }
  };

  const handleSelectArticle = (telegramId: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(telegramId)) {
      newSelected.delete(telegramId);
    } else {
      newSelected.add(telegramId);
    }
    setSelectedArticles(newSelected);
  };

  const handleBulkPublish = async () => {
    if (selectedArticles.size === 0) return;
    if (!confirm(`Publish ${selectedArticles.size} article(s)?`)) return;

    setBulkActionLoading('publish');
    try {
      const promises = Array.from(selectedArticles).map(telegramId =>
        fetch(`/api/admin/articles/${encodeURIComponent(telegramId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'published' }),
        })
      );
      await Promise.all(promises);
      setSelectedArticles(new Set());
      mutate();
    } catch (error) {
      console.error('Bulk publish error:', error);
      alert('Some articles failed to publish');
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedArticles.size === 0) return;
    if (!confirm(`Unpublish ${selectedArticles.size} article(s)?`)) return;

    setBulkActionLoading('unpublish');
    try {
      const promises = Array.from(selectedArticles).map(telegramId =>
        fetch(`/api/admin/articles/${encodeURIComponent(telegramId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'draft' }),
        })
      );
      await Promise.all(promises);
      setSelectedArticles(new Set());
      mutate();
    } catch (error) {
      console.error('Bulk unpublish error:', error);
      alert('Some articles failed to unpublish');
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedArticles.size === 0) return;
    if (!confirm(`Delete ${selectedArticles.size} article(s)? This cannot be undone.`)) return;

    setBulkActionLoading('delete');
    try {
      const promises = Array.from(selectedArticles).map(telegramId =>
        fetch(`/api/admin/articles/${encodeURIComponent(telegramId)}`, {
          method: 'DELETE',
        })
      );
      await Promise.all(promises);
      setSelectedArticles(new Set());
      mutate();
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Some articles failed to delete');
    } finally {
      setBulkActionLoading(null);
    }
  };

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
                onChange={(e) => handleSearchChange(e.target.value)}
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

      {/* Bulk actions bar */}
      {selectedArticles.size > 0 && (
        <div className="bg-midnight-800 rounded-xl border border-tactical-red/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-slate-light text-sm">
            <span className="font-bold text-tactical-red">{selectedArticles.size}</span> article{selectedArticles.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBulkPublish}
              disabled={bulkActionLoading !== null}
              className="flex items-center gap-2 px-3 py-1.5 bg-earth-olive/20 text-earth-olive rounded-lg hover:bg-earth-olive/30 transition-colors text-sm disabled:opacity-50"
            >
              {bulkActionLoading === 'publish' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Publish Selected
            </button>
            <button
              onClick={handleBulkUnpublish}
              disabled={bulkActionLoading !== null}
              className="flex items-center gap-2 px-3 py-1.5 bg-tactical-amber/20 text-tactical-amber rounded-lg hover:bg-tactical-amber/30 transition-colors text-sm disabled:opacity-50"
            >
              {bulkActionLoading === 'unpublish' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CircleOff className="h-4 w-4" />
              )}
              Unpublish Selected
            </button>
            <ShowForAdmin>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading !== null}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50"
              >
                {bulkActionLoading === 'delete' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Selected
              </button>
            </ShowForAdmin>
            <button
              onClick={() => setSelectedArticles(new Set())}
              className="px-3 py-1.5 text-slate-dark hover:text-slate-medium transition-colors text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Articles table */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
        {isLoading && articles.length === 0 ? (
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
                  <th className="w-10 px-4 py-3">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-dark hover:text-slate-medium transition-colors"
                    >
                      {selectedArticles.size === 0 ? (
                        <Square className="h-4 w-4" />
                      ) : selectedArticles.size === articles.length ? (
                        <CheckSquare className="h-4 w-4 text-tactical-red" />
                      ) : (
                        <MinusSquare className="h-4 w-4 text-tactical-red" />
                      )}
                    </button>
                  </th>
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
                    className={`hover:bg-midnight-700/30 transition-colors ${
                      selectedArticles.has(article.telegram_id) ? 'bg-tactical-red/5' : ''
                    }`}
                  >
                    <td className="w-10 px-4 py-3">
                      <button
                        onClick={() => handleSelectArticle(article.telegram_id)}
                        className="text-slate-dark hover:text-slate-medium transition-colors"
                      >
                        {selectedArticles.has(article.telegram_id) ? (
                          <CheckSquare className="h-4 w-4 text-tactical-red" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/articles/${article.telegram_id}`}
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
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full w-fit ${getStatusBadgeClass(article.status)}`}>
                          {article.status}
                        </span>
                        {article.scheduled_at && article.status === 'draft' && (
                          <span className={`text-xs flex items-center gap-1 ${
                            new Date(article.scheduled_at) <= new Date()
                              ? 'text-tactical-amber'
                              : 'text-slate-dark'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            {new Date(article.scheduled_at) <= new Date()
                              ? 'Ready'
                              : new Date(article.scheduled_at).toLocaleDateString()
                            }
                          </span>
                        )}
                      </div>
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
                            <button
                              onClick={() => {
                                setQuickEditArticleId(article.telegram_id);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-tactical-red hover:bg-midnight-700 transition-colors"
                            >
                              <Smartphone className="h-4 w-4" />
                              Quick Edit
                            </button>
                            <Link
                              href={`/admin/articles/${article.telegram_id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-medium hover:text-slate-light hover:bg-midnight-700 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                              Full Edit
                            </Link>
                            <Link
                              href={`/${article.channel}/frontline/${article.telegram_id}`}
                              target="_blank"
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-medium hover:text-slate-light hover:bg-midnight-700 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View on Site
                            </Link>
                            {article.status !== 'archived' && (
                              <button
                                onClick={() => handleStatusToggle(article.telegram_id, article.status)}
                                disabled={updatingStatus === article.telegram_id}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                                  article.status === 'published'
                                    ? 'text-tactical-amber hover:text-tactical-amber hover:bg-midnight-700'
                                    : 'text-earth-olive hover:text-earth-olive hover:bg-midnight-700'
                                } disabled:opacity-50`}
                              >
                                {updatingStatus === article.telegram_id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : article.status === 'published' ? (
                                  <CircleOff className="h-4 w-4" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                                {article.status === 'published' ? 'Unpublish' : 'Publish'}
                              </button>
                            )}
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

      {/* Quick Edit Modal */}
      <QuickEditModal
        isOpen={quickEditArticleId !== null}
        onClose={() => setQuickEditArticleId(null)}
        articleId={quickEditArticleId}
        onSaved={() => mutate()}
      />
    </div>
  );
}
