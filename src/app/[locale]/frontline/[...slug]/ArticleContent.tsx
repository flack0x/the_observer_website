"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, ExternalLink, Share2 } from "lucide-react";
import type { Locale, Dictionary } from "@/lib/i18n";
import { getRelativeTime, formatDate } from "@/lib/time";
import { getCategoryDisplay } from "@/lib/categories";

interface ArticleContentProps {
  article: {
    title: string;
    excerpt: string;
    content: string;
    date: Date;
    category: string;
    link: string;
  };
  locale: Locale;
  dict: Dictionary;
}

export default function ArticleContent({ article, locale, dict }: ArticleContentProps) {
  const isArabic = locale === 'ar';

  // Format content into paragraphs
  const paragraphs = article.content
    .split("\n\n")
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim());

  const telegramChannel = isArabic ? 'https://t.me/almuraqb' : 'https://t.me/observer_5';

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
            <ArrowLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
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
              <Clock className="h-4 w-4" />
              {getRelativeTime(article.date, locale)}
            </span>
          </div>

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
              <ExternalLink className="h-4 w-4" />
              {dict.common.viewOnTelegram}
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert(isArabic ? "تم نسخ الرابط!" : "Link copied!");
              }}
              className="flex items-center gap-2 text-sm text-slate-medium hover:text-tactical-red transition-colors"
            >
              <Share2 className="h-4 w-4" />
              {dict.common.share}
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

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-midnight-700"
        >
          <div className="bg-midnight-800 rounded-xl p-6 sm:p-8 text-center">
            <h3 className="font-heading text-lg font-bold text-slate-light mb-2">
              {isArabic ? 'ابق على اطلاع' : 'Stay Informed'}
            </h3>
            <p className="text-slate-medium text-sm mb-4">
              {isArabic
                ? 'انضم إلى قناتنا على تيليجرام للتحديثات الفورية'
                : 'Join our Telegram channel for real-time updates'}
            </p>
            <a
              href={telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-tactical-red text-white rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-tactical-red-hover transition-colors"
            >
              {isArabic ? 'انضم إلى المُراقِب' : 'Join The Observer'}
            </a>
          </div>
        </motion.div>
      </div>
    </article>
  );
}
