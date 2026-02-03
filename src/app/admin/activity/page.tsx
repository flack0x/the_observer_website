'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import {
  Activity,
  FileText,
  Image,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Pencil,
  Check,
  X,
  Trash2,
  Upload,
  UserCog,
} from 'lucide-react';
import { ActivityLog, ActivityAction, ActivityTargetType } from '@/lib/admin/types';
import { getActionLabel, getActionColor } from '@/lib/admin/logActivity';

interface ActivityResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Fetcher for SWR
const fetchActivity = async (url: string): Promise<ActivityResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch activity');
  return response.json();
};

// Icon for each action type
const ActionIcon = ({ action }: { action: ActivityAction }) => {
  switch (action) {
    case 'create':
      return <Plus className="h-4 w-4" />;
    case 'update':
      return <Pencil className="h-4 w-4" />;
    case 'publish':
      return <Check className="h-4 w-4" />;
    case 'unpublish':
      return <X className="h-4 w-4" />;
    case 'delete':
      return <Trash2 className="h-4 w-4" />;
    case 'upload':
      return <Upload className="h-4 w-4" />;
    case 'role_change':
      return <UserCog className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

// Icon for each target type
const TargetIcon = ({ type }: { type: ActivityTargetType }) => {
  switch (type) {
    case 'article':
      return <FileText className="h-4 w-4 text-slate-dark" />;
    case 'media':
      return <Image className="h-4 w-4 text-slate-dark" />;
    case 'user':
      return <User className="h-4 w-4 text-slate-dark" />;
    default:
      return <Activity className="h-4 w-4 text-slate-dark" />;
  }
};

// Format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function ActivityLogPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);

  // Filters
  const [actionFilter, setActionFilter] = useState<string>('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('');

  // Build URL for SWR cache key
  const buildUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (actionFilter) params.set('action', actionFilter);
    if (targetTypeFilter) params.set('targetType', targetTypeFilter);

    return `/api/admin/activity?${params}`;
  }, [page, pageSize, actionFilter, targetTypeFilter]);

  // SWR with caching
  const { data, isLoading } = useSWR<ActivityResponse>(
    buildUrl(),
    fetchActivity,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000,
      keepPreviousData: true,
      refreshInterval: 60000, // Auto-refresh every minute
    }
  );

  const activities = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
            Activity Log
          </h1>
          <p className="text-slate-medium mt-1">
            {total} total activities
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-2.5
                     text-slate-light text-sm
                     focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="create">Created</option>
            <option value="update">Updated</option>
            <option value="publish">Published</option>
            <option value="unpublish">Unpublished</option>
            <option value="delete">Deleted</option>
            <option value="upload">Uploaded</option>
            <option value="role_change">Role Changed</option>
          </select>

          {/* Target type filter */}
          <select
            value={targetTypeFilter}
            onChange={(e) => {
              setTargetTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-2.5
                     text-slate-light text-sm
                     focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="article">Articles</option>
            <option value="media">Media</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      {/* Activity list */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
        {isLoading && activities.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-tactical-red" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-slate-dark">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity found</p>
          </div>
        ) : (
          <div className="divide-y divide-midnight-700">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-start gap-4 p-4 hover:bg-midnight-700/30 transition-colors"
              >
                {/* Action icon with color */}
                <div className={`mt-0.5 ${getActionColor(activity.action)}`}>
                  <ActionIcon action={activity.action} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* User name */}
                    <span className="font-medium text-slate-light">
                      {activity.user?.full_name || activity.user?.email || 'Unknown user'}
                    </span>

                    {/* Action */}
                    <span className="text-slate-medium">
                      {getActionLabel(activity.action)}
                    </span>

                    {/* Target type icon */}
                    <TargetIcon type={activity.target_type} />

                    {/* Target title/link */}
                    {activity.target_type === 'article' && activity.target_id ? (
                      <Link
                        href={`/admin/articles/${activity.target_id}`}
                        className="text-tactical-red hover:underline truncate max-w-xs"
                      >
                        {activity.target_title || activity.target_id}
                      </Link>
                    ) : (
                      <span className="text-slate-medium truncate max-w-xs">
                        {activity.target_title || activity.target_id || 'Unknown'}
                      </span>
                    )}
                  </div>

                  {/* Details (if any) */}
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="mt-1 text-xs text-slate-dark">
                      {activity.action === 'publish' && 'previousStatus' in activity.details && (
                        <span>from {String(activity.details.previousStatus)}</span>
                      )}
                      {activity.action === 'unpublish' && (
                        <span>moved to draft</span>
                      )}
                      {activity.action === 'upload' && 'type' in activity.details && (
                        <span>{String(activity.details.type)}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-xs text-slate-dark whitespace-nowrap">
                  {formatRelativeTime(activity.created_at)}
                </div>
              </motion.div>
            ))}
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
    </div>
  );
}
