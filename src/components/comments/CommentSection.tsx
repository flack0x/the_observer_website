'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Loader2, Trash2, Edit2, X, Check, Reply, ChevronDown, ChevronUp, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Helper to get/set guest session ID
const getGuestSessionId = () => {
  if (typeof window === 'undefined') return null;
  let sessionId = localStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
};

// Helper to get/set guest name
const getStoredGuestName = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('guest_comment_name') || '';
};

const setStoredGuestName = (name: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('guest_comment_name', name);
};

interface Comment {
  id: string;
  content: string;
  parentId: string | null;
  isEdited: boolean;
  createdAt: string;
  userId: string | null;
  sessionId: string | null;
  isGuest: boolean;
  author: {
    name: string;
    avatar: string | null;
  };
}

interface CommentSectionProps {
  articleId: number;
  locale: string;
  dict: {
    comments: {
      title: string;
      placeholder: string;
      submit: string;
      reply: string;
      edit: string;
      delete: string;
      cancel: string;
      save: string;
      edited: string;
      loginToComment: string;
      noComments: string;
      showReplies: string;
      hideReplies: string;
      deleteConfirm: string;
      replyingTo: string;
      guestName: string;
      guestLabel: string;
    };
  };
}

export default function CommentSection({ articleId, locale, dict }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyGuestName, setReplyGuestName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const isArabic = locale === 'ar';
  const sessionId = getGuestSessionId();

  // Load stored guest name on mount
  useEffect(() => {
    const storedName = getStoredGuestName();
    setGuestName(storedName);
    setReplyGuestName(storedName);
  }, []);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Check if current user/guest owns a comment
  const isCommentOwner = (comment: Comment) => {
    if (isAuthenticated && user) {
      return comment.userId === user.id;
    }
    if (comment.isGuest && comment.sessionId && sessionId) {
      return comment.sessionId === sessionId;
    }
    return false;
  };

  // Submit new comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    // Validate guest name if not authenticated
    if (!isAuthenticated && !guestName.trim()) {
      setError(isArabic ? 'الاسم مطلوب' : 'Name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const body: Record<string, string | null | undefined> = {
        content: newComment.trim(),
      };

      if (!isAuthenticated) {
        body.guestName = guestName.trim();
        body.sessionId = sessionId;
        // Store guest name for future use
        setStoredGuestName(guestName.trim());
      }

      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to post comment');
        return;
      }

      setComments(prev => [...prev, data.comment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
      setError('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit reply
  const handleReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmitting) return;

    // Validate guest name if not authenticated
    if (!isAuthenticated && !replyGuestName.trim()) {
      setError(isArabic ? 'الاسم مطلوب' : 'Name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const body: Record<string, string | null | undefined> = {
        content: replyContent.trim(),
        parentId,
      };

      if (!isAuthenticated) {
        body.guestName = replyGuestName.trim();
        body.sessionId = sessionId;
        setStoredGuestName(replyGuestName.trim());
      }

      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to post reply');
        return;
      }

      setComments(prev => [...prev, data.comment]);
      setReplyTo(null);
      setReplyContent('');
      // Expand replies for this parent
      setExpandedReplies(prev => new Set(prev).add(parentId));
    } catch (err) {
      console.error('Failed to post reply:', err);
      setError('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit comment
  const handleEdit = async (commentId: string, comment: Comment) => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const body: Record<string, string | null | undefined> = {
        content: editContent.trim(),
      };

      // If guest, include sessionId
      if (comment.isGuest) {
        body.sessionId = sessionId;
      }

      const res = await fetch(`/api/articles/${articleId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to edit comment');
        return;
      }

      setComments(prev =>
        prev.map(c => (c.id === commentId ? data.comment : c))
      );
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Failed to edit comment:', err);
      setError('Failed to edit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleDelete = async (commentId: string, comment: Comment) => {
    if (!confirm(dict.comments.deleteConfirm)) return;

    try {
      // Build URL with sessionId for guests
      let url = `/api/articles/${articleId}/comments/${commentId}`;
      if (comment.isGuest && sessionId) {
        url += `?sessionId=${sessionId}`;
      }

      const res = await fetch(url, { method: 'DELETE' });

      if (res.ok) {
        // Remove comment and its replies
        setComments(prev =>
          prev.filter(c => c.id !== commentId && c.parentId !== commentId)
        );
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  // Group comments into threads
  const topLevelComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return isArabic ? 'الآن' : 'Just now';
    if (diffMins < 60) return isArabic ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return isArabic ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    if (diffDays < 7) return isArabic ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;

    return date.toLocaleDateString(isArabic ? 'ar' : 'en', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Toggle replies visibility
  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // Render single comment
  const renderComment = (comment: Comment, isReply = false) => {
    const replies = getReplies(comment.id);
    const isOwner = isCommentOwner(comment);
    const isEditing = editingId === comment.id;
    const isReplying = replyTo === comment.id;
    const showReplies = expandedReplies.has(comment.id);

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isReply ? 'ml-8 sm:ml-12 border-l-2 border-midnight-700 pl-4' : ''}`}
      >
        <div className="flex gap-3 py-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author.avatar ? (
              <Image
                src={comment.author.avatar}
                alt={comment.author.name}
                width={isReply ? 32 : 40}
                height={isReply ? 32 : 40}
                className="rounded-full object-cover"
              />
            ) : (
              <div
                className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full ${comment.isGuest ? 'bg-midnight-600' : 'bg-midnight-700'} flex items-center justify-center`}
              >
                <span className="text-slate-medium text-sm font-medium">
                  {comment.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-light text-sm">
                {comment.author.name}
              </span>
              {comment.isGuest && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-midnight-700 text-slate-dark">
                  {dict.comments.guestLabel}
                </span>
              )}
              <span className="text-xs text-slate-dark">
                {formatDate(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-slate-dark italic">
                  ({dict.comments.edited})
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-midnight-800 border border-midnight-600 rounded-lg px-3 py-2 text-slate-light text-sm resize-none focus:outline-none focus:border-tactical-red"
                  rows={3}
                  maxLength={2000}
                  dir={isArabic ? 'rtl' : 'ltr'}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(comment.id, comment)}
                    disabled={isSubmitting || !editContent.trim()}
                    className="flex items-center gap-1 px-3 py-1 bg-earth-olive text-white rounded text-xs hover:bg-earth-olive/90 disabled:opacity-50"
                  >
                    <Check className="h-3 w-3" />
                    {dict.comments.save}
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-midnight-700 text-slate-medium rounded text-xs hover:bg-midnight-600"
                  >
                    <X className="h-3 w-3" />
                    {dict.comments.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-medium text-sm mt-1 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}

            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center gap-3 mt-2">
                {!isReply && (
                  <button
                    onClick={() => {
                      setReplyTo(isReplying ? null : comment.id);
                      setReplyContent('');
                    }}
                    className="flex items-center gap-1 text-xs text-slate-dark hover:text-slate-medium transition-colors"
                  >
                    <Reply className="h-3 w-3" />
                    {dict.comments.reply}
                  </button>
                )}
                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="flex items-center gap-1 text-xs text-slate-dark hover:text-tactical-amber transition-colors"
                    >
                      <Edit2 className="h-3 w-3" />
                      {dict.comments.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id, comment)}
                      className="flex items-center gap-1 text-xs text-slate-dark hover:text-tactical-red transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      {dict.comments.delete}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Reply form */}
            <AnimatePresence>
              {isReplying && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <div className="text-xs text-slate-dark mb-2">
                    {dict.comments.replyingTo} <span className="text-slate-medium">{comment.author.name}</span>
                  </div>
                  {/* Guest name input for replies */}
                  {!isAuthenticated && (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 bg-midnight-800 border border-midnight-600 rounded-lg px-3 py-2">
                        <User className="h-4 w-4 text-slate-dark" />
                        <input
                          type="text"
                          value={replyGuestName}
                          onChange={(e) => setReplyGuestName(e.target.value)}
                          placeholder={dict.comments.guestName}
                          className="flex-1 bg-transparent text-slate-light text-sm focus:outline-none"
                          maxLength={50}
                          dir={isArabic ? 'rtl' : 'ltr'}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={dict.comments.placeholder}
                      className="flex-1 bg-midnight-800 border border-midnight-600 rounded-lg px-3 py-2 text-slate-light text-sm resize-none focus:outline-none focus:border-tactical-red"
                      rows={2}
                      maxLength={2000}
                      dir={isArabic ? 'rtl' : 'ltr'}
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleReply(comment.id)}
                        disabled={isSubmitting || !replyContent.trim() || (!isAuthenticated && !replyGuestName.trim())}
                        className="p-2 bg-tactical-red text-white rounded-lg hover:bg-tactical-red/90 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setReplyTo(null);
                          setReplyContent('');
                        }}
                        className="p-2 bg-midnight-700 text-slate-medium rounded-lg hover:bg-midnight-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Replies toggle */}
            {replies.length > 0 && !isReply && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-1 text-xs text-tactical-red hover:text-tactical-red/80 mt-3 transition-colors"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    {dict.comments.hideReplies} ({replies.length})
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    {dict.comments.showReplies} ({replies.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Nested replies */}
        <AnimatePresence>
          {showReplies && replies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {replies.map(reply => renderComment(reply, true))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="mt-12 border-t border-midnight-700 pt-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-dark" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-midnight-700 pt-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-tactical-red" />
        <h2 className="font-heading text-xl font-bold text-slate-light">
          {dict.comments.title}
        </h2>
        <span className="text-sm text-slate-dark">({comments.length})</span>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-tactical-red/10 border border-tactical-red/30 rounded-lg text-tactical-red text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New comment form - available to everyone */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-midnight-700 flex items-center justify-center">
              <span className="text-slate-medium text-sm font-medium">
                {isAuthenticated
                  ? (user?.email?.charAt(0).toUpperCase() || 'U')
                  : (guestName.charAt(0).toUpperCase() || '?')}
              </span>
            </div>
          </div>
          <div className="flex-1">
            {/* Guest name input */}
            {!isAuthenticated && (
              <div className="mb-3">
                <div className="flex items-center gap-2 bg-midnight-800 border border-midnight-600 rounded-lg px-4 py-2.5">
                  <User className="h-4 w-4 text-slate-dark" />
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={dict.comments.guestName}
                    className="flex-1 bg-transparent text-slate-light focus:outline-none"
                    maxLength={50}
                    dir={isArabic ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={dict.comments.placeholder}
              className="w-full bg-midnight-800 border border-midnight-600 rounded-lg px-4 py-3 text-slate-light resize-none focus:outline-none focus:border-tactical-red transition-colors"
              rows={3}
              maxLength={2000}
              dir={isArabic ? 'rtl' : 'ltr'}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-dark">
                {newComment.length}/2000
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim() || (!isAuthenticated && !guestName.trim())}
                className="flex items-center gap-2 px-4 py-2 bg-tactical-red text-white rounded-lg font-medium text-sm hover:bg-tactical-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {dict.comments.submit}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {topLevelComments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-midnight-700 mx-auto mb-3" />
          <p className="text-slate-dark">{dict.comments.noComments}</p>
        </div>
      ) : (
        <div className="divide-y divide-midnight-700">
          {topLevelComments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
}
