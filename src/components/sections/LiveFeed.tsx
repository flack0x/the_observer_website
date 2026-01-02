"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Radio, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useArticles } from "@/lib/hooks";
import type { Locale, Dictionary } from "@/lib/i18n";

interface LiveFeedProps {
  locale: Locale;
  dict: Dictionary;
}

const categoriesEN = ["All", "Political", "Military", "Economic", "Intelligence", "Analysis"];
const categoriesAR = ["الكل", "سياسي", "عسكري", "اقتصادي", "استخباراتي", "تحليل"];

export default function LiveFeed({ locale, dict }: LiveFeedProps) {
  const isArabic = locale === 'ar';
  const categories = isArabic ? categoriesAR : categoriesEN;
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const { articles, loading } = useArticles(locale);

  // Filter articles by category
  const filteredArticles = activeCategory === categories[0]
    ? articles
    : articles.filter(a =>
        a.category.toLowerCase().includes(activeCategory.toLowerCase())
      );

  const displayArticles = filteredArticles.slice(0, 6);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-midnight-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title with live indicator */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Radio className="h-5 w-5 sm:h-6 sm:w-6 text-tactical-red" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-tactical-red animate-pulse" />
              </div>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-light">
                  {dict.home.liveFeed}
                </h2>
                <p className="text-xs sm:text-sm text-slate-dark flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {isArabic ? 'تم التحديث منذ لحظات' : 'Updated moments ago'}
                </p>
              </div>
            </div>

            {/* View all link */}
            <Link
              href={`/${locale}/frontline`}
              className="hidden sm:flex items-center gap-2 font-heading text-sm font-medium uppercase tracking-wider text-tactical-red hover:text-tactical-amber transition-colors"
            >
              {dict.common.viewAll}
              <ArrowRight className="h-4 w-4" />
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-6 w-6 text-tactical-red animate-spin" />
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
                className="group relative bg-midnight-800 rounded-xl p-5 sm:p-6 border border-midnight-700 hover:border-tactical-red/50 transition-all duration-300"
              >
                {/* Category & Time */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-tactical-red/10 text-tactical-red font-heading text-[10px] sm:text-xs font-medium uppercase">
                    {article.category}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-dark flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.timestamp}
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

                {/* Read more */}
                <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
                  <span className="text-xs text-slate-dark">
                    {isArabic ? '٣ دقائق قراءة' : '3 min read'}
                  </span>
                  <Link
                    href={`/${locale}/frontline/${article.id}`}
                    className="flex items-center gap-1 text-xs font-heading font-medium uppercase tracking-wider text-tactical-red hover:text-tactical-amber transition-colors"
                  >
                    {dict.common.readMore}
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* First article badge */}
                {index === 0 && (
                  <div className="absolute -top-2 -right-2">
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
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
