'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  BookOpen,
} from 'lucide-react';
import { ShowForAdmin } from '@/lib/auth';

interface BookReview {
  id: number;
  review_id: string;
  channel: 'en' | 'ar';
  book_title: string;
  author: string;
  rating: number | null;
  recommendation_level: string | null;
  status: string;
  created_at: string;
  cover_image_url: string | null;
}

interface BookReviewsResponse {
  data: BookReview[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Fetcher for SWR
const fetchBookReviews = async (url: string): Promise<BookReviewsResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch book reviews');
  return response.json();
};

export default function AdminBooksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [channelFilter, setChannelFilter] = useState(searchParams.get('channel') || 'all');

  // Action menu
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearch(value);
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

    return `/api/admin/books?${params}`;
  }, [page, pageSize, debouncedSearch, statusFilter, channelFilter]);

  // SWR with caching
  const { data, isLoading, mutate } = useSWR<BookReviewsResponse>(
    buildUrl(),
    fetchBookReviews,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000,
      keepPreviousData: true,
    }
  );

  const bookReviews = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this book review? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/books/${encodeURIComponent(reviewId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate();
      } else {
        alert('Failed to delete book review');
      }
    } catch (error) {
      console.error('Error deleting book review:', error);
      alert('Failed to delete book review');
    }

    setActiveMenu(null);
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

  const getRecommendationBadge = (level: string | null) => {
    switch (level) {
      case 'essential':
        return 'bg-tactical-red/10 text-tactical-red';
      case 'recommended':
        return 'bg-earth-olive/10 text-earth-olive';
      case 'optional':
        return 'bg-tactical-amber/10 text-tactical-amber';
      default:
        return '';
    }
  };

  // Render star rating
  const renderRating = (rating: number | null) => {
    if (!rating) return <span className="text-slate-dark">—</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? 'text-tactical-amber fill-tactical-amber'
                : 'text-slate-dark'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-tactical-red" />
            Book Reviews
          </h1>
          <p className="text-slate-medium mt-1">
            {total} total book reviews
          </p>
        </div>

        <Link
          href="/admin/books/new"
          className="flex items-center gap-2 bg-tactical-red text-white font-heading font-bold uppercase tracking-wider
                   px-4 py-2.5 rounded-lg hover:bg-tactical-red-hover transition-colors text-sm w-fit"
        >
          <Plus className="h-4 w-4" />
          New Book Review
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
                placeholder="Search by title or author..."
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
        </div>
      </div>

      {/* Book Reviews table */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
        {isLoading && bookReviews.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-tactical-red" />
          </div>
        ) : bookReviews.length === 0 ? (
          <div className="text-center py-12 text-slate-dark">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No book reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-midnight-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Book
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Author
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Channel
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Rating
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
                {bookReviews.map((review) => (
                  <motion.tr
                    key={review.review_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-midnight-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-midnight-700 rounded flex items-center justify-center flex-shrink-0">
                          {review.cover_image_url ? (
                            <img
                              src={review.cover_image_url}
                              alt=""
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <BookOpen className="h-4 w-4 text-slate-dark" />
                          )}
                        </div>
                        <Link
                          href={`/admin/books/${review.review_id}`}
                          className="text-slate-light hover:text-tactical-red transition-colors font-medium line-clamp-2"
                        >
                          {review.book_title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-medium">
                        {review.author}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs uppercase text-slate-medium">
                        {review.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {renderRating(review.rating)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(review.status)}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-dark">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActiveMenu(activeMenu === review.review_id ? null : review.review_id)}
                          className="p-1.5 rounded-lg hover:bg-midnight-700 text-slate-dark hover:text-slate-medium transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {activeMenu === review.review_id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-midnight-800 border border-midnight-700 rounded-lg shadow-lg py-1 z-10">
                            <Link
                              href={`/admin/books/${review.review_id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-medium hover:text-slate-light hover:bg-midnight-700 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </Link>
                            <Link
                              href={`/${review.channel}/books/${review.review_id}`}
                              target="_blank"
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-medium hover:text-slate-light hover:bg-midnight-700 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View on Site
                            </Link>
                            <ShowForAdmin>
                              <button
                                onClick={() => handleDelete(review.review_id)}
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
