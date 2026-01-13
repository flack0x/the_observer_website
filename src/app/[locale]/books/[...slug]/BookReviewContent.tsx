"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  Star,
  User,
  List,
  Send,
  ExternalLink,
} from "lucide-react";
import type { Locale, Dictionary } from "@/lib/i18n";
import { getTelegramChannel } from "@/lib/config";

interface BookReview {
  id: string;
  bookTitle: string;
  author: string;
  coverImageUrl: string | null;
  excerpt: string | null;
  description: string;
  keyPoints: string[];
  rating: number | null;
  recommendationLevel: 'essential' | 'recommended' | 'optional' | null;
  telegramLink: string | null;
  channel: 'en' | 'ar';
  createdAt: Date;
}

interface BookReviewContentProps {
  review: BookReview;
  locale: Locale;
  dict: Dictionary;
}

export default function BookReviewContent({ review, locale, dict }: BookReviewContentProps) {
  const isArabic = locale === 'ar';
  const telegramChannel = getTelegramChannel(locale);

  // Render star rating
  const renderRating = (rating: number | null, size: 'sm' | 'md' = 'md') => {
    if (!rating) return null;
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'text-tactical-amber fill-tactical-amber'
                : 'text-slate-dark'
            }`}
          />
        ))}
        <span className={`${isArabic ? 'mr-2' : 'ml-2'} text-sm text-slate-medium`}>({rating}/5)</span>
      </div>
    );
  };

  // Get recommendation badge
  const getRecommendationBadge = (level: string | null) => {
    switch (level) {
      case 'essential':
        return { bg: 'bg-tactical-red/10 border-tactical-red/20', text: 'text-tactical-red', label: dict.books.essential };
      case 'recommended':
        return { bg: 'bg-earth-olive/10 border-earth-olive/20', text: 'text-earth-olive', label: dict.books.recommended };
      case 'optional':
        return { bg: 'bg-tactical-amber/10 border-tactical-amber/20', text: 'text-tactical-amber', label: dict.books.optional };
      default:
        return null;
    }
  };

  const badge = getRecommendationBadge(review.recommendationLevel);

  return (
    <div className="min-h-screen bg-midnight-900" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="border-b border-midnight-700 bg-midnight-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link
            href={`/${locale}/books`}
            className="inline-flex items-center gap-2 text-slate-medium hover:text-tactical-red transition-colors font-heading text-sm uppercase tracking-wider"
          >
            <ArrowLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
            {dict.books.backToBooks}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <article className="py-8 md:py-12">
        <div className="mx-auto max-w-4xl px-4">
          {/* Mobile Layout: Title, Badge, Rating first */}
          <div className="md:hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Title */}
              <h1 className="font-heading text-2xl font-bold text-slate-light mb-3 leading-tight">
                {review.bookTitle}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-2 mb-4 text-base text-slate-medium">
                <User className="h-4 w-4 text-slate-dark" />
                <span>{review.author}</span>
              </div>

              {/* Rating and Badge Row */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {renderRating(review.rating, 'sm')}
                {badge && (
                  <span className={`${badge.bg} border px-3 py-1 rounded-full font-heading font-bold uppercase text-xs ${badge.text}`}>
                    {badge.label}
                  </span>
                )}
              </div>

              {/* Book Cover - Smaller on mobile */}
              <div className="relative aspect-[3/4] w-48 mx-auto rounded-xl overflow-hidden border border-midnight-700 bg-midnight-800 shadow-xl mb-6">
                {review.coverImageUrl ? (
                  <Image
                    src={review.coverImageUrl}
                    alt={review.bookTitle}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-16 w-16 text-slate-dark" />
                  </div>
                )}
              </div>

              {/* Telegram Link - Compact on mobile */}
              {review.telegramLink && (
                <a
                  href={review.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-midnight-600 bg-midnight-800 px-4 py-2.5 font-heading text-xs font-medium uppercase tracking-wider text-slate-light transition-all hover:border-tactical-red hover:text-tactical-red"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {dict.books.telegramLink}
                </a>
              )}

              {/* Excerpt */}
              {review.excerpt && (
                <p className="text-base text-slate-medium leading-relaxed mb-6 border-l-4 border-tactical-red pl-4">
                  {review.excerpt}
                </p>
              )}

              {/* Description */}
              <div className="mb-6">
                <h2 className="font-heading text-base font-bold uppercase tracking-wider text-slate-light mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-tactical-red" />
                  {dict.books.aboutBook}
                </h2>
                <div
                  className="prose prose-invert prose-sm max-w-none text-slate-medium leading-relaxed [&>p]:mb-3 [&>h3]:text-slate-light [&>h3]:font-heading [&>h3]:text-sm [&>h3]:font-bold [&>h3]:mt-4 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>blockquote]:border-l-4 [&>blockquote]:border-tactical-red [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-light"
                  dangerouslySetInnerHTML={{ __html: review.description }}
                />
              </div>

              {/* Key Points */}
              {review.keyPoints && review.keyPoints.length > 0 && (
                <div className="mb-6">
                  <h2 className="font-heading text-base font-bold uppercase tracking-wider text-slate-light mb-3 flex items-center gap-2">
                    <List className="h-4 w-4 text-tactical-red" />
                    {dict.books.keyPoints}
                  </h2>
                  <ul className="space-y-2">
                    {review.keyPoints.map((point, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-slate-medium"
                      >
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-tactical-red/10 text-xs font-bold text-tactical-red">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Join Community CTA */}
              <div className="mt-8 rounded-xl border border-midnight-700 bg-midnight-800 p-4">
                <h3 className="font-heading text-base font-bold uppercase tracking-wider text-slate-light mb-2">
                  {dict.article.stayInformed}
                </h3>
                <p className="text-sm text-slate-medium mb-3">
                  {dict.article.joinChannelDesc}
                </p>
                <a
                  href={telegramChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-tactical-red px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover"
                >
                  <Send className="h-3.5 w-3.5" />
                  {dict.article.joinObserver}
                </a>
              </div>
            </motion.div>
          </div>

          {/* Desktop Layout: Side by side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:grid md:grid-cols-[280px_1fr] gap-10"
          >
            {/* Book Cover - Sticky on desktop */}
            <div className="relative">
              <div className="sticky top-24">
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-midnight-700 bg-midnight-800 shadow-xl">
                  {review.coverImageUrl ? (
                    <Image
                      src={review.coverImageUrl}
                      alt={review.bookTitle}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-20 w-20 text-slate-dark" />
                    </div>
                  )}
                </div>

                {/* Recommendation Badge */}
                {badge && (
                  <div className={`mt-4 ${badge.bg} border px-4 py-2 rounded-lg text-center`}>
                    <span className={`font-heading font-bold uppercase text-sm ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>
                )}

                {/* Telegram Link */}
                {review.telegramLink && (
                  <a
                    href={review.telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-midnight-600 bg-midnight-800 px-4 py-3 font-heading text-sm font-medium uppercase tracking-wider text-slate-light transition-all hover:border-tactical-red hover:text-tactical-red"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {dict.books.telegramLink}
                  </a>
                )}
              </div>
            </div>

            {/* Book Details */}
            <div>
              {/* Rating */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4"
              >
                {renderRating(review.rating)}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-heading text-3xl lg:text-4xl font-bold text-slate-light mb-4 leading-tight"
              >
                {review.bookTitle}
              </motion.h1>

              {/* Author */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 mb-6 text-lg text-slate-medium"
              >
                <User className="h-5 w-5 text-slate-dark" />
                <span>{dict.books.author} {review.author}</span>
              </motion.div>

              {/* Excerpt */}
              {review.excerpt && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-slate-medium leading-relaxed mb-8 border-l-4 border-tactical-red pl-4"
                >
                  {review.excerpt}
                </motion.p>
              )}

              {/* Description */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-tactical-red" />
                  {dict.books.aboutBook}
                </h2>
                <div
                  className="prose prose-invert max-w-none text-slate-medium leading-relaxed [&>p]:mb-4 [&>h3]:text-slate-light [&>h3]:font-heading [&>h3]:text-base [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>blockquote]:border-l-4 [&>blockquote]:border-tactical-red [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-light"
                  dangerouslySetInnerHTML={{ __html: review.description }}
                />
              </motion.div>

              {/* Key Points */}
              {review.keyPoints && review.keyPoints.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8"
                >
                  <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light mb-4 flex items-center gap-2">
                    <List className="h-5 w-5 text-tactical-red" />
                    {dict.books.keyPoints}
                  </h2>
                  <ul className="space-y-3">
                    {review.keyPoints.map((point, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-start gap-3 text-slate-medium"
                      >
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-tactical-red/10 text-xs font-bold text-tactical-red">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed">{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Join Community CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 rounded-xl border border-midnight-700 bg-midnight-800 p-6"
              >
                <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light mb-2">
                  {dict.article.stayInformed}
                </h3>
                <p className="text-slate-medium mb-4">
                  {dict.article.joinChannelDesc}
                </p>
                <a
                  href={telegramChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-tactical-red px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover"
                >
                  <Send className="h-4 w-4" />
                  {dict.article.joinObserver}
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </article>
    </div>
  );
}
