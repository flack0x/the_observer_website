"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  ArrowRight,
  AlertTriangle,
  Filter,
  Search,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useArticles } from "@/lib/hooks";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getCategoryList, filterByCategory, getCategoryDisplay } from "@/lib/categories";
import { getRelativeTime } from "@/lib/time";

export default function FrontlinePage() {
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const isArabic = locale === 'ar';
  const dict = getDictionary(locale);
  const categories = getCategoryList(locale);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const { articles, loading, error } = useArticles(locale);

  // Filter articles by category and search
  const filteredByCategory = filterByCategory(articles, activeCategory, locale);

  const filteredArticles = searchQuery
    ? filteredByCategory.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredByCategory;

  // Transform filtered articles
  const newsArticles = filteredArticles.map((article) => ({
    id: article.id,
    category: article.category,
    categoryDisplay: getCategoryDisplay(article.category, locale),
    title: article.title,
    excerpt: article.excerpt,
    timestamp: getRelativeTime(article.date, locale),
    location: isArabic ? "المنطقة" : "Region",
    isBreaking: article.isBreaking,
    readTime: `${Math.ceil((article.content?.split(" ").length || 100) / 200)} ${isArabic ? 'دقيقة' : 'min'}`,
  }));

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-tactical-red mx-auto mb-4" />
          <p className="text-slate-medium">{dict.common.loading}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || newsArticles.length === 0) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-tactical-amber mx-auto mb-4" />
          <p className="text-slate-medium">{dict.common.noArticles}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="border-b border-midnight-700 bg-midnight-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-tactical-red/10">
              <AlertTriangle className="h-6 w-6 text-tactical-red" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-slate-light">
                {dict.frontline.title}
              </h1>
              <p className="text-slate-dark">{dict.frontline.subtitle}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-midnight-700 bg-midnight-800/50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-dark" />
              <span className="text-sm text-slate-dark">{isArabic ? 'تصفية:' : 'Filter:'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-1.5 font-heading text-xs font-medium uppercase tracking-wider transition-all ${
                    activeCategory === category
                      ? "bg-tactical-red text-white"
                      : "border border-midnight-600 text-slate-medium hover:border-tactical-red hover:text-tactical-red"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className={`${isArabic ? 'mr-auto' : 'ml-auto'} flex items-center gap-2 rounded-lg border border-midnight-600 bg-midnight-700 px-3 py-2`}>
              <Search className="h-4 w-4 text-slate-dark" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.common.search + '...'}
                className="bg-transparent text-sm text-slate-light placeholder-slate-dark outline-none w-32 sm:w-48"
                dir={isArabic ? 'rtl' : 'ltr'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {newsArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-xl border border-midnight-600 bg-midnight-800 p-6 transition-all hover:border-tactical-red card-hover"
              >
                {article.isBreaking && (
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="mb-4 inline-flex items-center gap-1 rounded-full bg-tactical-red px-3 py-1 text-xs font-bold uppercase text-white"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    {isArabic ? 'عاجل' : 'Breaking'}
                  </motion.div>
                )}

                <div className="mb-3 flex items-center gap-3 flex-wrap">
                  <span className="rounded bg-midnight-600 px-2 py-1 font-heading text-xs font-medium uppercase text-slate-medium">
                    {article.categoryDisplay}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-dark">
                    <Clock className="h-3 w-3" />
                    {article.timestamp}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-dark">
                    <MapPin className="h-3 w-3" />
                    {article.location}
                  </span>
                </div>

                <h2 className="mb-3 font-heading text-xl font-bold uppercase leading-tight text-slate-light transition-colors group-hover:text-tactical-red">
                  {article.title}
                </h2>

                <p className="mb-4 font-body text-sm leading-relaxed text-slate-medium">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between border-t border-midnight-700 pt-4">
                  <span className="text-xs text-slate-dark">{article.readTime} {isArabic ? 'قراءة' : 'read'}</span>
                  <Link
                    href={`/${locale}/frontline/${article.id}`}
                    className="flex items-center gap-1 font-heading text-xs font-medium uppercase tracking-wider text-tactical-red transition-colors hover:text-tactical-amber"
                  >
                    {isArabic ? 'التقرير الكامل' : 'Full Report'}
                    <ArrowRight className={`h-3 w-3 ${isArabic ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 flex justify-center">
            <button className="flex items-center gap-2 rounded-lg border border-midnight-600 bg-midnight-800 px-8 py-3 font-heading text-sm font-medium uppercase tracking-wider text-slate-light transition-all hover:border-tactical-red hover:text-tactical-red">
              {isArabic ? 'تحميل المزيد' : 'Load More Reports'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
