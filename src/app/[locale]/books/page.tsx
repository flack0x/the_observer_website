"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Star,
  ArrowRight,
  Search,
  Loader2,
  AlertTriangle,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useBookReviews } from "@/lib/hooks";
import { getDictionary, type Locale } from "@/lib/i18n";

const BOOKS_PER_PAGE = 6;

export default function BooksPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const isArabic = locale === 'ar';
  const dict = getDictionary(locale);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(BOOKS_PER_PAGE);

  const { bookReviews, loading, error } = useBookReviews(locale);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setVisibleCount(BOOKS_PER_PAGE);
  };

  // Filter books by search
  const filteredBooks = searchQuery
    ? bookReviews.filter(book =>
        book.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : bookReviews;

  // Get recommendation badge color
  const getRecommendationBadge = (level: string | null) => {
    switch (level) {
      case 'essential':
        return { bg: 'bg-tactical-red/10', text: 'text-tactical-red', label: dict.books.essential };
      case 'recommended':
        return { bg: 'bg-earth-olive/10', text: 'text-earth-olive', label: dict.books.recommended };
      case 'optional':
        return { bg: 'bg-tactical-amber/10', text: 'text-tactical-amber', label: dict.books.optional };
      default:
        return null;
    }
  };

  // Render star rating
  const renderRating = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-tactical-amber fill-tactical-amber'
                : 'text-slate-dark'
            }`}
          />
        ))}
      </div>
    );
  };

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

  // Show error/empty state
  if (error || bookReviews.length === 0) {
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
                <BookOpen className="h-6 w-6 text-tactical-red" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-slate-light">
                  {dict.books.title}
                </h1>
                <p className="text-slate-dark">{dict.books.subtitle}</p>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-tactical-amber mx-auto mb-4" />
            <p className="text-slate-medium">{dict.books.noBooks}</p>
          </div>
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
              <BookOpen className="h-6 w-6 text-tactical-red" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-slate-light">
                {dict.books.title}
              </h1>
              <p className="text-slate-dark">{dict.books.subtitle}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="border-b border-midnight-700 bg-midnight-800/50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 rounded-lg border border-midnight-600 bg-midnight-700 px-3 py-2 focus-within:border-tactical-red focus-within:ring-1 focus-within:ring-tactical-red transition-colors max-w-md">
            <Search className="h-4 w-4 text-slate-dark" aria-hidden="true" />
            <label htmlFor="books-search" className="sr-only">{dict.common.search}</label>
            <input
              id="books-search"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={dict.common.search + '...'}
              className="bg-transparent text-sm text-slate-light placeholder-slate-dark outline-none flex-1"
              dir={isArabic ? 'rtl' : 'ltr'}
            />
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Results count */}
          <p className="text-sm text-slate-dark mb-6">
            {dict.frontline.showingOf
              .replace('{current}', String(Math.min(visibleCount, filteredBooks.length)))
              .replace('{total}', String(filteredBooks.length))}
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.slice(0, visibleCount).map((book, index) => {
              const badge = getRecommendationBadge(book.recommendationLevel);

              return (
                <motion.article
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group rounded-xl border border-midnight-600 bg-midnight-800 overflow-hidden transition-all hover:border-tactical-red card-hover"
                >
                  {/* Book Cover */}
                  <div className="relative aspect-[3/4] w-full bg-midnight-700">
                    {book.coverImageUrl ? (
                      <Image
                        src={book.coverImageUrl}
                        alt={book.bookTitle}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-16 w-16 text-slate-dark" />
                      </div>
                    )}
                    {/* Recommendation Badge */}
                    {badge && (
                      <div className={`absolute top-3 ${isArabic ? 'left-3' : 'right-3'} ${badge.bg} px-2 py-1 rounded-full`}>
                        <span className={`text-xs font-heading font-bold uppercase ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Rating */}
                    <div className="mb-3">
                      {renderRating(book.rating)}
                    </div>

                    {/* Title */}
                    <h2 className="mb-2 font-heading text-lg font-bold leading-tight text-slate-light transition-colors group-hover:text-tactical-red line-clamp-2">
                      {book.bookTitle}
                    </h2>

                    {/* Author */}
                    <div className="flex items-center gap-2 mb-3 text-sm text-slate-medium">
                      <User className="h-4 w-4 text-slate-dark" aria-hidden="true" />
                      <span>{dict.books.author} {book.author}</span>
                    </div>

                    {/* Excerpt */}
                    {book.excerpt && (
                      <p className="mb-4 font-body text-sm leading-relaxed text-slate-medium line-clamp-3">
                        {book.excerpt}
                      </p>
                    )}

                    {/* Read Review Link */}
                    <div className="flex items-center justify-end border-t border-midnight-700 pt-4">
                      <Link
                        href={`/${locale}/books/${book.id}`}
                        className="flex items-center gap-1 font-heading text-xs font-medium uppercase tracking-wider text-tactical-red transition-colors hover:text-tactical-amber"
                      >
                        {dict.books.readReview}
                        <ArrowRight className={`h-3 w-3 ${isArabic ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* Load More */}
          {visibleCount < filteredBooks.length && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setVisibleCount(prev => prev + BOOKS_PER_PAGE)}
                className="flex items-center gap-2 rounded-lg border border-midnight-600 bg-midnight-800 px-8 py-3 font-heading text-sm font-medium uppercase tracking-wider text-slate-light transition-all hover:border-tactical-red hover:text-tactical-red"
              >
                {dict.books.loadMore}
                <span className="text-xs text-slate-dark">
                  ({filteredBooks.length - visibleCount} {dict.books.remaining})
                </span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
