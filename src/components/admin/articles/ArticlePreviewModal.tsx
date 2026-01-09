'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Globe } from 'lucide-react';
import Image from 'next/image';
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

  // Format content into paragraphs
  const paragraphs = content
    .split('\n\n')
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim());

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
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => {
                  // Check if it's a section header
                  const isHeader =
                    /^[IVX]+\.\s/.test(paragraph) ||
                    (paragraph.length < 100 && paragraph === paragraph.toUpperCase());

                  if (isHeader) {
                    return (
                      <h2
                        key={index}
                        className="font-heading text-xl font-bold text-slate-light mt-8 mb-4 uppercase tracking-wider"
                      >
                        {paragraph}
                      </h2>
                    );
                  }

                  return (
                    <p
                      key={index}
                      className="text-slate-medium leading-relaxed mb-4 text-base sm:text-lg"
                    >
                      {paragraph}
                    </p>
                  );
                })
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
