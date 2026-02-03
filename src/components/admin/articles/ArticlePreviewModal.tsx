'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Globe } from 'lucide-react';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import { getCategoryDisplay } from '@/lib/categories';
import { getCountryName } from '@/lib/i18n';

interface ArticlePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    titleEn: string;
    titleAr: string;
    excerptEn: string;
    excerptAr: string;
    contentEn: string;
    contentAr: string;
    category: string;
    countries: string[];
    imageUrl: string;
    videoUrl: string;
  };
}

export default function ArticlePreviewModal({ isOpen, onClose, article }: ArticlePreviewModalProps) {
  const [previewLocale, setPreviewLocale] = useState<'en' | 'ar'>('en');

  const isArabic = previewLocale === 'ar';
  const title = isArabic ? article.titleAr : article.titleEn;
  const content = isArabic ? article.contentAr : article.contentEn;

  // Sanitize HTML content from TipTap editor
  const sanitizedContent = useMemo(() => {
    if (!content) return '';
    // DOMPurify sanitizes the HTML to prevent XSS attacks
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a', 'img'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class'],
    });
  }, [content]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl my-8 bg-midnight-900 rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-midnight-800 border-b border-midnight-700">
            <div className="flex items-center gap-4">
              <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
                Preview
              </h2>

              {/* Language toggle */}
              <div className="flex items-center gap-1 bg-midnight-700 rounded-lg p-1">
                <button
                  onClick={() => setPreviewLocale('en')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    previewLocale === 'en'
                      ? 'bg-tactical-red text-white'
                      : 'text-slate-medium hover:text-slate-light'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  EN
                </button>
                <button
                  onClick={() => setPreviewLocale('ar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    previewLocale === 'ar'
                      ? 'bg-tactical-red text-white'
                      : 'text-slate-medium hover:text-slate-light'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  AR
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium hover:text-slate-light transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Preview content */}
          <div
            className="p-6 sm:p-8 lg:p-12"
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            {/* Article header */}
            <header className="mb-8">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-tactical-red/10 text-tactical-red font-heading text-xs font-medium uppercase">
                  {getCategoryDisplay(article.category, previewLocale)}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-dark">
                  <Clock className="h-4 w-4" />
                  {isArabic ? 'الآن' : 'Just now'}
                </span>
              </div>

              {/* Countries */}
              {article.countries && article.countries.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <MapPin className="h-4 w-4 text-slate-dark" />
                  {article.countries.map((country) => (
                    <span
                      key={country}
                      className="rounded-full bg-midnight-700 border border-midnight-600 px-2.5 py-1 text-xs text-slate-medium"
                    >
                      {getCountryName(country, previewLocale)}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-light leading-tight">
                {title || (isArabic ? 'عنوان المقال' : 'Article Title')}
              </h1>
            </header>

            {/* Hero Media */}
            {(article.imageUrl || article.videoUrl) && (
              <div className="mb-8">
                {article.videoUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-midnight-800">
                    <video
                      src={article.videoUrl}
                      className="h-full w-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : article.imageUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-midnight-800">
                    <Image
                      src={article.imageUrl}
                      alt={title || 'Article image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 768px"
                      unoptimized
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* Article content */}
            <div className="prose prose-invert max-w-none">
              {sanitizedContent ? (
                <div
                  className="text-slate-medium leading-relaxed text-base sm:text-lg
                           [&>p]:mb-4 [&>h1]:font-heading [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-slate-light [&>h1]:mt-8 [&>h1]:mb-4
                           [&>h2]:font-heading [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-light [&>h2]:mt-8 [&>h2]:mb-4
                           [&>h3]:font-heading [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-slate-light [&>h3]:mt-6 [&>h3]:mb-3
                           [&_strong]:text-slate-light [&_strong]:font-semibold [&_b]:text-slate-light [&_b]:font-semibold
                           [&_em]:italic [&_i]:italic [&_u]:underline [&_s]:line-through
                           [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2
                           [&_blockquote]:border-l-4 [&_blockquote]:border-tactical-red [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-dark
                           [&_a]:text-tactical-red [&_a]:underline [&_a:hover]:text-tactical-amber
                           [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              ) : (
                <p className="text-slate-dark italic">
                  {isArabic ? 'لا يوجد محتوى للعرض' : 'No content to preview'}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end px-6 py-4 bg-midnight-800 border-t border-midnight-700">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-midnight-700 border border-midnight-500 text-slate-light
                       hover:border-tactical-red hover:text-tactical-red transition-colors text-sm font-medium"
            >
              Close Preview
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
