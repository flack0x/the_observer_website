"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Radio, BookOpen, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useArticles } from "@/lib/hooks";
import CategoryPlaceholder from "@/components/ui/CategoryPlaceholder";
import ArticleStats from "@/components/articles/ArticleStats";
import { getCategoryList, filterByCategory, getCategoryDisplay } from "@/lib/categories";
import { getRelativeTime } from "@/lib/time";
import type { Locale, Dictionary } from "@/lib/i18n";

interface LiveFeedProps {
  locale: Locale;
  dict: Dictionary;
}

// Calculate read time based on word count (average 200 words per minute)
function calculateReadTime(content: string, locale: Locale): string {
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));

  if (locale === 'ar') {
    // Arabic numbers
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const arabicMinutes = String(minutes).split('').map(d => arabicNumerals[parseInt(d)]).join('');
    return `${arabicMinutes} دقائق قراءة`;
  }
  return `${minutes} min read`;
}

// Skeleton loading card component
function SkeletonCard() {
  return (
    <div className="bg-midnight-800 rounded-xl border border-midnight-700 animate-pulse overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-video w-full bg-midnight-700" />
      <div className="p-5 sm:p-6">
        {/* Category & Time skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-20 bg-midnight-700 rounded-full" />
          <div className="h-4 w-16 bg-midnight-700 rounded" />
        </div>
        {/* Title skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-5 w-full bg-midnight-700 rounded" />
          <div className="h-5 w-3/4 bg-midnight-700 rounded" />
        </div>
        {/* Excerpt skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-midnight-700 rounded" />
          <div className="h-4 w-full bg-midnight-700 rounded" />
          <div className="h-4 w-2/3 bg-midnight-700 rounded" />
        </div>
        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
          <div className="h-4 w-20 bg-midnight-700 rounded" />
          <div className="h-4 w-24 bg-midnight-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function LiveFeed({ locale, dict }: LiveFeedProps) {
  const isArabic = locale === 'ar';
  const categories = getCategoryList(locale);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const { articles, loading } = useArticles(locale);

  // Filter articles by category
  const filteredArticles = filterByCategory(articles, activeCategory, locale);
  const displayArticles = filteredArticles.slice(0, 6);

  // Get last update time from most recent article
  const lastUpdateTime = articles.length > 0
    ? getRelativeTime(articles[0].date, locale)
    : (isArabic ? 'جاري التحميل...' : 'Loading...');

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-midnight-900" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title with live indicator */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Radio className="h-5 w-5 sm:h-6 sm:w-6 text-tactical-red" aria-hidden="true" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-tactical-red animate-pulse" />
              </div>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-light">
                  {dict.home.liveFeed}
                </h2>
                <p className="text-xs sm:text-sm text-slate-dark flex items-center gap-2">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {isArabic ? `آخر تحديث: ${lastUpdateTime}` : `Last updated: ${lastUpdateTime}`}
                </p>
              </div>
            </div>

            {/* View all link */}
            <Link
              href={`/${locale}/frontline`}
              className="hidden sm:flex items-center gap-2 font-heading text-sm font-medium uppercase tracking-wider text-tactical-red hover:text-tactical-amber transition-colors"
            >
              {dict.common.viewAll}
              <ArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} aria-hidden="true" />
            </Link>
          </div>

          {/* Category Filters */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 px-4 py-2 rounded-full font-heading text-xs font-medium uppercase tracking-wider transition-all ${
                  activeCategory === category
                    ? "bg-tactical-red text-white"
                    : "bg-midnight-800 text-slate-medium hover:bg-midnight-700 hover:text-slate-light"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State - Skeleton Cards */}
        {loading && (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {!loading && (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-midnight-800 rounded-xl border border-midnight-700 hover:border-tactical-red/50 transition-all duration-300 overflow-hidden"
              >
                {/* Article Media */}
                <div className="relative aspect-video w-full bg-midnight-700 group-hover:opacity-90 transition-opacity">
                  {article.videoUrl ? (
                    <div className="relative h-full w-full">
                      <video
                        src={article.videoUrl}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tactical-red/90">
                          <Play className="h-4 w-4 text-white" fill="white" />
                        </div>
                      </div>
                    </div>
                  ) : article.imageUrl ? (
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      {...(index === 0 ? { priority: true } : {})}
                    />
                  ) : (
                    <CategoryPlaceholder category={article.category} />
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  {/* Category & Time */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-tactical-red/10 text-tactical-red font-heading text-[10px] sm:text-xs font-medium uppercase">
                      {getCategoryDisplay(article.category, locale)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-dark flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {getRelativeTime(article.date, locale)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-base sm:text-lg font-bold text-slate-light leading-tight mb-3 group-hover:text-tactical-red transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-slate-medium leading-relaxed line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>

                  {/* Stats & Actions */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-midnight-700">
                    <div className="flex items-center justify-between">
                      <ArticleStats 
                        views={article.views} 
                        likes={article.likes} 
                        dislikes={article.dislikes} 
                      />
                      <Link
                        href={`/${locale}/frontline/${article.slug}`}
                        className="flex items-center gap-1 text-xs font-heading font-medium uppercase tracking-wider text-tactical-red hover:text-tactical-amber transition-colors"
                      >
                        {dict.common.readMore}
                        <ArrowRight className={`h-3 w-3 transition-transform ${isArabic ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} aria-hidden="true" />
                      </Link>
                    </div>
                    
                    <span className="text-xs text-slate-dark flex items-center gap-1">
                      <BookOpen className="h-3 w-3" aria-hidden="true" />
                      {calculateReadTime(article.content, locale)}
                    </span>
                  </div>
                </div>

                {/* First article badge */}
                {index === 0 && (
                  <div className={`absolute top-2 ${isArabic ? 'left-2' : 'right-2'} z-10`}>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-tactical-red text-white text-[10px] font-heading font-bold uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      {isArabic ? 'الأحدث' : 'Latest'}
                    </span>
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && displayArticles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-dark">{dict.common.noArticles}</p>
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-8 sm:hidden">
          <Link
            href={`/${locale}/frontline`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-midnight-800 border border-midnight-700 font-heading text-sm font-medium uppercase tracking-wider text-slate-light hover:border-tactical-red hover:text-tactical-red transition-all"
          >
            {dict.common.viewAll}
            <ArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
