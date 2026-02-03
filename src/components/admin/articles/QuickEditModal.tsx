'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Smartphone,
} from 'lucide-react';

interface QuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string | null;
  onSaved: () => void;
}

interface ArticleData {
  telegram_id: string;
  channel: 'en' | 'ar';
  title: string;
  content: string;
  status: string;
}

export function QuickEditModal({ isOpen, onClose, articleId, onSaved }: QuickEditModalProps) {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Fetch article when modal opens
  useEffect(() => {
    if (isOpen && articleId) {
      fetchArticle();
    } else {
      // Reset state when modal closes
      setArticle(null);
      setTitle('');
      setContent('');
      setError(null);
      setSaveStatus('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, articleId]);

  const fetchArticle = async () => {
    if (!articleId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(articleId)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch article');
      }

      // Handle both single article and website article pairs
      const articleData = result.data.en || result.data.ar || result.data;
      setArticle(articleData);
      setTitle(articleData.title || '');
      // Strip HTML tags for simple editing, preserve basic formatting
      setContent(stripHtmlForEditing(articleData.content || ''));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple HTML stripping that preserves paragraph breaks
  const stripHtmlForEditing = (html: string): string => {
    return html
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Convert plain text back to HTML
  const textToHtml = (text: string): string => {
    return text
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
  };

  const handleSave = async () => {
    if (!article) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(article.telegram_id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: textToHtml(content),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSaveStatus('saved');
      onSaved();

      // Close after brief success indication
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const isRtl = article?.channel === 'ar';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />

          {/* Modal - slides up from bottom on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                       bg-midnight-800 rounded-t-2xl sm:rounded-xl border border-midnight-700
                       w-full sm:w-full sm:max-w-lg max-h-[90vh] sm:max-h-[80vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-midnight-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-tactical-red" />
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                  Quick Edit
                </h2>
                {article && (
                  <span className="text-xs uppercase text-slate-dark bg-midnight-700 px-1.5 py-0.5 rounded">
                    {article.channel}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-midnight-700 text-slate-dark hover:text-slate-light transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-tactical-red" />
                </div>
              ) : error && !article ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              ) : article ? (
                <div className="space-y-4">
                  {/* Error message */}
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-medium text-slate-medium mb-1.5 uppercase tracking-wider">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      dir={isRtl ? 'rtl' : 'ltr'}
                      className={`w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-3
                               text-slate-light placeholder:text-slate-dark text-base
                               focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none
                               ${isRtl ? 'text-right' : ''}`}
                    />
                  </div>

                  {/* Content - Simple textarea */}
                  <div>
                    <label className="block text-xs font-medium text-slate-medium mb-1.5 uppercase tracking-wider">
                      Content
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      dir={isRtl ? 'rtl' : 'ltr'}
                      rows={12}
                      placeholder="Article content..."
                      className={`w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-3
                               text-slate-light placeholder:text-slate-dark text-base leading-relaxed
                               focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none
                               resize-none
                               ${isRtl ? 'text-right' : ''}`}
                    />
                    <p className="text-xs text-slate-dark mt-1">
                      Use blank lines to separate paragraphs
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer - Fixed at bottom */}
            {article && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-midnight-700 flex-shrink-0 bg-midnight-800">
                <div className="flex items-center gap-2">
                  {saveStatus === 'saved' && (
                    <span className="flex items-center gap-1 text-earth-olive text-sm">
                      <Check className="h-4 w-4" />
                      Saved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-lg text-slate-medium hover:text-slate-light hover:bg-midnight-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || saveStatus === 'saved'}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-tactical-red text-white font-medium
                             hover:bg-tactical-red-hover transition-colors text-sm
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : saveStatus === 'saved' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
