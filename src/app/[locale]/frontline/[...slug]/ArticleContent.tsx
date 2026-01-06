"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, ExternalLink, Share2, Check, MapPin } from "lucide-react";
import { getCountryName, type Locale, type Dictionary } from "@/lib/i18n";
import { getRelativeTime, formatDate } from "@/lib/time";
import { getCategoryDisplay } from "@/lib/categories";

interface ArticleContentProps {
  article: {
    title: string;
    excerpt: string;
    content: string;
    date: Date;
    category: string;
    countries: string[];
    link: string;
  };
  locale: Locale;
  dict: Dictionary;
}

export default function ArticleContent({ article, locale, dict }: ArticleContentProps) {
  const isArabic = locale === 'ar';
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Format content into paragraphs
  const paragraphs = article.content
    .split("\n\n")
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim());

  return (
    <article className="min-h-screen bg-midnight-900 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href={`/${locale}/frontline`}
            className="inline-flex items-center gap-2 text-slate-medium hover:text-tactical-red transition-colors"
          >
            <ArrowLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} aria-hidden="true" />
            <span className="text-sm font-heading uppercase tracking-wider">
              {dict.frontline.backToFrontline}
            </span>
          </Link>
        </motion.div>

        {/* Article header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 sm:mb-12"
        >
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-tactical-red/10 text-tactical-red font-heading text-xs font-medium uppercase">
              {getCategoryDisplay(article.category, locale)}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-dark">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {getRelativeTime(article.date, locale)}
            </span>
          </div>

          {/* Countries */}
          {article.countries && article.countries.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <MapPin className="h-4 w-4 text-slate-dark" aria-hidden="true" />
              {article.countries.map((country) => (
                <span
                  key={country}
                  className="rounded-full bg-midnight-700 border border-midnight-600 px-2.5 py-1 text-xs text-slate-medium"
                >
                  {getCountryName(country, locale)}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-light leading-tight mb-6">
            {article.title}
          </h1>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-midnight-700">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-slate-medium hover:text-tactical-red transition-colors"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              {dict.common.viewOnTelegram}
            </a>
            <button
              onClick={handleCopyLink}
              className="relative flex items-center gap-2 text-sm text-slate-medium hover:text-tactical-red transition-colors"
              aria-label={dict.common.share}
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              {dict.common.share}
              <AnimatePresence>
                {showCopied && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded bg-earth-olive text-white text-xs whitespace-nowrap"
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                    {dict.article.copied}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.header>

        {/* Article content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          {paragraphs.map((paragraph, index) => {
            // Check if it's a section header (Roman numerals or short uppercase)
            const isHeader =
              /^[IVX]+\.\s/.test(paragraph) ||
              (paragraph.length < 100 && paragraph === paragraph.toUpperCase());

            // Skip footer content
            if (
              paragraph.includes("@observer") ||
              paragraph.includes("@almuraqb") ||
              paragraph.startsWith("Link to") ||
              paragraph.startsWith("🔵")
            ) {
              return null;
            }

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
          })}
        </motion.div>

      </div>
    </article>
  );
}
