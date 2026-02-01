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
  Play,
  Calendar,
  Video,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import CategoryPlaceholder from "@/components/ui/CategoryPlaceholder";
import ArticleStats from "@/components/articles/ArticleStats";
import { useArticles } from "@/lib/hooks";
import { getDictionary, getCountryName, type Locale } from "@/lib/i18n";
import { getCategoryList, filterByCategory, getCategoryDisplay } from "@/lib/categories";
import { getRelativeTime } from "@/lib/time";

const ARTICLES_PER_PAGE = 6;

// Top countries from database analysis (sorted by article count)
const TOP_COUNTRIES = [
  'Israel', 'Palestine', 'Iran', 'Lebanon', 'USA', 'Iraq',
  'Yemen', 'Syria', 'Russia', 'China', 'Saudi Arabia', 'Egypt'
];

// Time range options in days (null = all time)
const TIME_RANGES = [
  { key: 'all', days: null },
  { key: '7d', days: 7 },
  { key: '30d', days: 30 },
  { key: '90d', days: 90 },
] as const;

type TimeRangeKey = typeof TIME_RANGES[number]['key'];

export default function FrontlinePage() {
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const isArabic = locale === 'ar';
  const dict = getDictionary(locale);
  const categories = getCategoryList(locale);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRangeKey>('all');
  const [videoOnly, setVideoOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);

  const { articles, loading, error } = useArticles(locale);

  // Reset visible count when filters change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setVisibleCount(ARTICLES_PER_PAGE);
  };

  const handleCountryChange = (country: string | null) => {
    setActiveCountry(country);
    setVisibleCount(ARTICLES_PER_PAGE);
  };

  const handleTimeRangeChange = (range: TimeRangeKey) => {
    setActiveTimeRange(range);
    setVisibleCount(ARTICLES_PER_PAGE);
  };

  const handleVideoToggle = () => {
    setVideoOnly(prev => !prev);
    setVisibleCount(ARTICLES_PER_PAGE);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setVisibleCount(ARTICLES_PER_PAGE);
  };

  // Filter articles by category, country, time range, video, and search
  // Each filter is applied in sequence, all filters work together
  const filteredByCategory = filterByCategory(articles, activeCategory, locale);

  const filteredByCountry = activeCountry
    ? filteredByCategory.filter(article =>
        article.countries?.includes(activeCountry)
      )
    : filteredByCategory;

  const filteredByTime = (() => {
    const range = TIME_RANGES.find(r => r.key === activeTimeRange);
    if (!range || range.days === null) return filteredByCountry;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - range.days);

    return filteredByCountry.filter(article => {
      const articleDate = new Date(article.date);
      return articleDate >= cutoffDate;
    });
  })();

  const filteredByVideo = videoOnly
    ? filteredByTime.filter(article => article.videoUrl)
    : filteredByTime;

  const filteredArticles = searchQuery
    ? filteredByVideo.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredByVideo;

  // Transform filtered articles
  const newsArticles = filteredArticles.map((article) => ({
    id: article.id,
    category: article.category,
    categoryDisplay: getCategoryDisplay(article.category, locale),
    title: article.title,
    excerpt: article.excerpt,
    timestamp: getRelativeTime(article.date, locale),
    countries: article.countries || [],
    isBreaking: article.isBreaking,
    readTime: `${Math.ceil((article.content?.split(" ").length || 100) / 200)} ${isArabic ? 'دقيقة' : 'min'}`,
    imageUrl: article.imageUrl,
    videoUrl: article.videoUrl,
    views: article.views,
    likes: article.likes,
    dislikes: article.dislikes,
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
          {/* Search bar - full width on top */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-dark" aria-hidden="true" />
              <label htmlFor="frontline-search" className="sr-only">{dict.common.search}</label>
              <input
                id="frontline-search"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={dict.common.search + '...'}
                className="w-full rounded-lg border border-midnight-600 bg-midnight-700 py-2 pl-10 pr-4 text-sm text-slate-light placeholder-slate-dark outline-none focus:border-tactical-red focus:ring-1 focus:ring-tactical-red transition-colors"
                dir={isArabic ? 'rtl' : 'ltr'}
              />
            </div>
          </div>
          {/* Category filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="h-4 w-4 text-slate-dark" />
              <span className="text-sm text-slate-dark">{dict.frontline.filter}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
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
          </div>
          {/* Country filters */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-2 shrink-0">
              <MapPin className="h-4 w-4 text-slate-dark" />
              <span className="text-sm text-slate-dark">{isArabic ? 'الدولة:' : 'Region:'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCountryChange(null)}
                className={`rounded-full px-3 py-1 font-heading text-xs font-medium uppercase tracking-wider transition-all ${
                  activeCountry === null
                    ? "bg-intel-blue text-white"
                    : "border border-midnight-600 text-slate-medium hover:border-intel-blue hover:text-intel-blue"
                }`}
              >
                {isArabic ? 'الكل' : 'All'}
              </button>
              {TOP_COUNTRIES.map((country) => (
                <button
                  key={country}
                  onClick={() => handleCountryChange(country)}
                  className={`rounded-full px-3 py-1 font-heading text-xs font-medium tracking-wider transition-all ${
                    activeCountry === country
                      ? "bg-intel-blue text-white"
                      : "border border-midnight-600 text-slate-medium hover:border-intel-blue hover:text-intel-blue"
                  }`}
                >
                  {getCountryName(country, locale)}
                </button>
              ))}
            </div>
          </div>
          {/* Time range and Video toggle */}
          <div className="flex flex-wrap items-center gap-6 mt-3">
            {/* Time range */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <Calendar className="h-4 w-4 text-slate-dark" />
                <span className="text-sm text-slate-dark">{isArabic ? 'الفترة:' : 'Time:'}</span>
              </div>
              <div className="flex gap-1">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.key}
                    onClick={() => handleTimeRangeChange(range.key)}
                    className={`rounded-full px-3 py-1 font-heading text-xs font-medium uppercase tracking-wider transition-all ${
                      activeTimeRange === range.key
                        ? "bg-tactical-amber text-midnight-900"
                        : "border border-midnight-600 text-slate-medium hover:border-tactical-amber hover:text-tactical-amber"
                    }`}
                  >
                    {range.key === 'all'
                      ? (isArabic ? 'الكل' : 'All')
                      : range.key === '7d'
                      ? (isArabic ? '٧ أيام' : '7d')
                      : range.key === '30d'
                      ? (isArabic ? '٣٠ يوم' : '30d')
                      : (isArabic ? '٩٠ يوم' : '90d')
                    }
                  </button>
                ))}
              </div>
            </div>
            {/* Video toggle */}
            <button
              onClick={handleVideoToggle}
              className={`flex items-center gap-2 rounded-full px-3 py-1 font-heading text-xs font-medium uppercase tracking-wider transition-all ${
                videoOnly
                  ? "bg-green-600 text-white"
                  : "border border-midnight-600 text-slate-medium hover:border-green-600 hover:text-green-500"
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              {isArabic ? 'فيديو فقط' : 'Video Only'}
            </button>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Results count */}
          <p className="text-sm text-slate-dark mb-6">
            {dict.frontline.showingOf
              .replace('{current}', String(Math.min(visibleCount, newsArticles.length)))
              .replace('{total}', String(newsArticles.length))}
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            {newsArticles.slice(0, visibleCount).map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-xl border border-midnight-600 bg-midnight-800 overflow-hidden transition-all hover:border-tactical-red card-hover"
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tactical-red/90">
                          <Play className="h-5 w-5 text-white" fill="white" />
                        </div>
                      </div>
                    </div>
                  ) : article.imageUrl ? (
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <CategoryPlaceholder category={article.category} />
                  )}
                </div>

                <div className="p-6">
                  {article.isBreaking && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="mb-4 inline-flex items-center gap-1 rounded-full bg-tactical-red px-3 py-1 text-xs font-bold uppercase text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      {dict.frontline.breaking}
                    </motion.div>
                  )}

                <div className="mb-3 flex items-center gap-2 flex-wrap">
                  <span className="rounded bg-midnight-600 px-2 py-1 font-heading text-xs font-medium uppercase text-slate-medium">
                    {article.categoryDisplay}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-dark">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {article.timestamp}
                  </span>
                  {article.countries.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <MapPin className="h-3 w-3 text-slate-dark" aria-hidden="true" />
                      {article.countries.slice(0, 3).map((country) => (
                        <span
                          key={country}
                          className="rounded bg-midnight-700 px-1.5 py-0.5 text-[10px] text-slate-medium"
                        >
                          {getCountryName(country, locale)}
                        </span>
                      ))}
                      {article.countries.length > 3 && (
                        <span className="text-[10px] text-slate-dark">
                          +{article.countries.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <h2 className="mb-3 font-heading text-xl font-bold uppercase leading-tight text-slate-light transition-colors group-hover:text-tactical-red">
                  {article.title}
                </h2>

                <p className="mb-4 font-body text-sm leading-relaxed text-slate-medium">
                  {article.excerpt}
                </p>

                <div className="flex flex-col gap-3 border-t border-midnight-700 pt-4">
                  <div className="flex items-center justify-between">
                    <ArticleStats 
                      views={article.views} 
                      likes={article.likes} 
                      dislikes={article.dislikes} 
                    />
                    <Link
                      href={`/${locale}/frontline/${article.id}`}
                      className="flex items-center gap-1 font-heading text-xs font-medium uppercase tracking-wider text-tactical-red transition-colors hover:text-tactical-amber"
                    >
                      {dict.frontline.fullReport}
                      <ArrowRight className={`h-3 w-3 ${isArabic ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </Link>
                  </div>
                  <span className="text-xs text-slate-dark">{article.readTime} {dict.frontline.read}</span>
                </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          {visibleCount < newsArticles.length && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setVisibleCount(prev => prev + ARTICLES_PER_PAGE)}
                className="flex items-center gap-2 rounded-lg border border-midnight-600 bg-midnight-800 px-8 py-3 font-heading text-sm font-medium uppercase tracking-wider text-slate-light transition-all hover:border-tactical-red hover:text-tactical-red"
              >
                {dict.frontline.loadMore}
                <span className="text-xs text-slate-dark">
                  ({newsArticles.length - visibleCount} {dict.frontline.remaining})
                </span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
