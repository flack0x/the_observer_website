'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  CheckCircle,
  Globe,
} from 'lucide-react';
import DOMPurify from 'dompurify';

interface ArticleComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
}

interface ComparisonResult {
  paragraphsEn: string[];
  paragraphsAr: string[];
  issues: ComparisonIssue[];
  overallStatus: 'good' | 'warning' | 'error';
}

interface ComparisonIssue {
  type: 'missing_ar' | 'missing_en' | 'length_mismatch' | 'empty_content';
  message: string;
  paragraphIndex?: number;
}

export function ArticleComparisonModal({
  isOpen,
  onClose,
  titleEn,
  titleAr,
  contentEn,
  contentAr,
}: ArticleComparisonModalProps) {

  // Parse content into paragraphs and analyze differences
  const comparison = useMemo((): ComparisonResult => {
    const issues: ComparisonIssue[] = [];

    // Extract paragraphs from HTML
    const extractParagraphs = (html: string): string[] => {
      if (!html || !html.trim()) return [];

      // Create a temporary div to parse HTML
      const div = document.createElement('div');
      div.innerHTML = DOMPurify.sanitize(html);

      // Get all block-level elements
      const blocks: string[] = [];
      const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT);

      let node = walker.nextNode();
      while (node) {
        const el = node as HTMLElement;
        if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE'].includes(el.tagName)) {
          const text = el.textContent?.trim();
          if (text) {
            blocks.push(text);
          }
        }
        node = walker.nextNode();
      }

      // Fallback: split by double newlines if no blocks found
      if (blocks.length === 0) {
        return html
          .replace(/<[^>]+>/g, '\n')
          .split(/\n{2,}/)
          .map(p => p.trim())
          .filter(p => p.length > 0);
      }

      return blocks;
    };

    const paragraphsEn = extractParagraphs(contentEn);
    const paragraphsAr = extractParagraphs(contentAr);

    // Check for empty content
    if (paragraphsEn.length === 0) {
      issues.push({
        type: 'empty_content',
        message: 'English content is empty',
      });
    }
    if (paragraphsAr.length === 0) {
      issues.push({
        type: 'empty_content',
        message: 'Arabic content is empty',
      });
    }

    // Check paragraph count mismatch
    if (paragraphsEn.length > 0 && paragraphsAr.length > 0) {
      const diff = Math.abs(paragraphsEn.length - paragraphsAr.length);
      if (diff > 0) {
        if (paragraphsEn.length > paragraphsAr.length) {
          issues.push({
            type: 'missing_ar',
            message: `Arabic version has ${diff} fewer paragraph${diff > 1 ? 's' : ''} than English`,
          });
        } else {
          issues.push({
            type: 'missing_en',
            message: `English version has ${diff} fewer paragraph${diff > 1 ? 's' : ''} than Arabic`,
          });
        }
      }

      // Check for significant length differences in corresponding paragraphs
      const minLength = Math.min(paragraphsEn.length, paragraphsAr.length);
      for (let i = 0; i < minLength; i++) {
        const lenEn = paragraphsEn[i].length;
        const lenAr = paragraphsAr[i].length;
        // Arabic text is typically shorter due to diacritics, but if EN is 3x longer, flag it
        if (lenEn > lenAr * 3 || lenAr > lenEn * 3) {
          issues.push({
            type: 'length_mismatch',
            message: `Paragraph ${i + 1} has significant length difference`,
            paragraphIndex: i,
          });
        }
      }
    }

    // Determine overall status
    let overallStatus: 'good' | 'warning' | 'error' = 'good';
    if (issues.some(i => i.type === 'empty_content')) {
      overallStatus = 'error';
    } else if (issues.length > 0) {
      overallStatus = 'warning';
    }

    return { paragraphsEn, paragraphsAr, issues, overallStatus };
  }, [contentEn, contentAr]);

  const getStatusColor = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return 'text-earth-olive';
      case 'warning': return 'text-tactical-amber';
      case 'error': return 'text-red-400';
    }
  };

  const getStatusBg = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return 'bg-earth-olive/10 border-earth-olive/20';
      case 'warning': return 'bg-tactical-amber/10 border-tactical-amber/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
    }
  };

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
            className="fixed inset-0 bg-black/80 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 z-50 bg-midnight-800 rounded-xl border border-midnight-700 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-midnight-700 flex-shrink-0">
              <div className="flex items-center gap-4">
                <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
                  Article Comparison
                </h2>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusBg(comparison.overallStatus)}`}>
                  {comparison.overallStatus === 'good' ? (
                    <CheckCircle className={`h-4 w-4 ${getStatusColor(comparison.overallStatus)}`} />
                  ) : (
                    <AlertTriangle className={`h-4 w-4 ${getStatusColor(comparison.overallStatus)}`} />
                  )}
                  <span className={`text-sm font-medium ${getStatusColor(comparison.overallStatus)}`}>
                    {comparison.overallStatus === 'good' ? 'Looks Good' :
                     comparison.overallStatus === 'warning' ? `${comparison.issues.length} Issue${comparison.issues.length > 1 ? 's' : ''}` :
                     'Missing Content'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-midnight-700 text-slate-dark hover:text-slate-light transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Issues Summary */}
            {comparison.issues.length > 0 && (
              <div className="px-6 py-3 bg-midnight-700/30 border-b border-midnight-700 flex-shrink-0">
                <div className="flex flex-wrap gap-2">
                  {comparison.issues.map((issue, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded ${
                        issue.type === 'empty_content' ? 'bg-red-500/20 text-red-400' :
                        'bg-tactical-amber/20 text-tactical-amber'
                      }`}
                    >
                      {issue.message}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Title Comparison */}
            <div className="grid grid-cols-2 gap-4 px-6 py-4 border-b border-midnight-700 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-medium text-slate-medium uppercase tracking-wider">English Title</span>
                </div>
                <p className="text-slate-light font-medium">{titleEn || <span className="text-slate-dark italic">Empty</span>}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-medium text-slate-medium uppercase tracking-wider">Arabic Title</span>
                </div>
                <p className="text-slate-light font-medium text-right" dir="rtl">{titleAr || <span className="text-slate-dark italic">Empty</span>}</p>
              </div>
            </div>

            {/* Content Comparison - Side by Side */}
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-2 h-full">
                {/* English Column */}
                <div className="border-r border-midnight-700 flex flex-col h-full">
                  <div className="px-4 py-2 bg-midnight-700/50 border-b border-midnight-700 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-medium text-slate-medium uppercase tracking-wider">English</span>
                      </div>
                      <span className="text-xs text-slate-dark">{comparison.paragraphsEn.length} paragraphs</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {comparison.paragraphsEn.length === 0 ? (
                      <p className="text-slate-dark italic text-center py-8">No content</p>
                    ) : (
                      comparison.paragraphsEn.map((para, idx) => {
                        const hasIssue = comparison.issues.some(i => i.paragraphIndex === idx);
                        const isMissing = idx >= comparison.paragraphsAr.length;
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              isMissing ? 'bg-tactical-amber/10 border border-tactical-amber/20' :
                              hasIssue ? 'bg-tactical-amber/5 border border-tactical-amber/10' :
                              'bg-midnight-700/50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-slate-dark font-mono mt-0.5">{idx + 1}</span>
                              <p className="text-sm text-slate-light leading-relaxed flex-1">{para}</p>
                            </div>
                            {isMissing && (
                              <p className="text-xs text-tactical-amber mt-2">⚠ No matching Arabic paragraph</p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Arabic Column */}
                <div className="flex flex-col h-full">
                  <div className="px-4 py-2 bg-midnight-700/50 border-b border-midnight-700 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-dark">{comparison.paragraphsAr.length} paragraphs</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-medium uppercase tracking-wider">العربية</span>
                        <Globe className="h-4 w-4 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3" dir="rtl">
                    {comparison.paragraphsAr.length === 0 ? (
                      <p className="text-slate-dark italic text-center py-8">لا يوجد محتوى</p>
                    ) : (
                      comparison.paragraphsAr.map((para, idx) => {
                        const hasIssue = comparison.issues.some(i => i.paragraphIndex === idx);
                        const isMissing = idx >= comparison.paragraphsEn.length;
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              isMissing ? 'bg-tactical-amber/10 border border-tactical-amber/20' :
                              hasIssue ? 'bg-tactical-amber/5 border border-tactical-amber/10' :
                              'bg-midnight-700/50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <p className="text-sm text-slate-light leading-relaxed flex-1">{para}</p>
                              <span className="text-xs text-slate-dark font-mono mt-0.5">{idx + 1}</span>
                            </div>
                            {isMissing && (
                              <p className="text-xs text-tactical-amber mt-2 text-right">⚠ لا يوجد فقرة إنجليزية مطابقة</p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-midnight-700 flex-shrink-0 bg-midnight-800">
              <div className="flex items-center justify-between text-xs text-slate-dark">
                <span>Paragraph-by-paragraph comparison • Scroll each column independently</span>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-midnight-700 text-slate-light hover:bg-midnight-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
