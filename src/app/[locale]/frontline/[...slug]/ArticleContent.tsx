"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, ExternalLink, Share2, Check, MapPin, Eye } from "lucide-react";
import Image from "next/image";
import DOMPurify from "dompurify";
import ArticleInteractions from "@/components/articles/ArticleInteractions";
import { getCountryName, type Locale, type Dictionary } from "@/lib/i18n";
import { getRelativeTime, formatDate } from "@/lib/time";
import { getCategoryDisplay } from "@/lib/categories";
import { getClient } from "@/lib/supabase/client";

/**
 * Convert Telegram markdown to HTML and clean up the content
 */
function processContent(rawContent: string, title: string): string {
  let content = rawContent;

  // Remove corrupted Unicode replacement characters (appear as ���)
  content = content.replace(/\uFFFD+/g, '');

  // Remove the header section (title, category, countries, orgs) from the beginning
  // These patterns match the structured header formats
  const headerPatterns = [
    /^🔴\*\*Category\*\*[\s\S]*?(?=\n\n[^*\n])/i,
    /^🔴\*\*Title[:\s].*?\*\*\n/i,
    /^\*\*Category\*\*:?\s*[^\n]*\n/gi,
    /^\*\*Title\*\*\n\n\*\*[^*]+\*\*\n/i,
    /^\*\*Countries?\s*(?:Involved)?\*\*:?\s*[^\n]*\n/gi,
    /^\*\*(?:Orgs?|Organizations?)\s*(?:&\s*Actors?)?\*\*:?\s*[^\n]*\n/gi,
    /^\*\*(?:Brief|Introduction|Overview)\s*:?\*\*\s*/gi,
  ];

  // Try to find where the actual content starts (after headers)
  const lines = content.split('\n');
  let contentStartIndex = 0;

  // Skip header lines at the beginning
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].trim();
    // Skip if it's a header-like line
    if (
      line.match(/^\*\*(?:Category|Title|Countries?|Orgs?|Organizations?|Brief)/i) ||
      line.match(/^🔴/) ||
      line.match(/^[🔵🟢🟡⚫⚪💳👍🤔🚨💰📺⚠️🔽]/) ||
      line.match(/^\*\*[^*]+\*\*$/) && i < 10 || // Standalone bold line in header
      line === '' ||
      line.match(/^(?:Geopolitics|Military|Political|Economic)\s*\|/i) // Category line
    ) {
      // Check if this bold line might be the title (skip it)
      if (line.includes(title.substring(0, 30))) {
        contentStartIndex = i + 1;
        continue;
      }
      // Skip empty lines and header markers at the start
      if (i === contentStartIndex || line === '') {
        contentStartIndex = i + 1;
      }
      continue;
    }
    // Found actual content
    break;
  }

  // Take content from after headers
  content = lines.slice(contentStartIndex).join('\n').trim();

  // Remove leading emoji markers
  content = content.replace(/^[🔴🔵🟢🟡⚫⚪⚠️🚨📢💳👍🤔📺💰🔽\s]+/, '');

  // Convert Telegram markdown to HTML
  // Bold: **text** → <strong>text</strong>
  content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic: __text__ → <em>text</em>
  content = content.replace(/__([^_]+)__/g, '<em>$1</em>');

  // Also handle single underscore italic (less common)
  content = content.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>');

  // Convert bullet points
  content = content.replace(/^[•]\s*/gm, '• ');

  // Remove remaining standalone emoji markers that are decorative
  content = content.replace(/^[🔴🔵🟢🟡💳👍🤔📺💰🚨⚠️🔽]\s*/gm, '');

  // Clean up multiple newlines
  content = content.replace(/\n{3,}/g, '\n\n');

  // Remove footer/channel references
  content = content.replace(/\n*@observer_?\d*\s*$/gi, '');
  content = content.replace(/\n*@almuraqb\s*$/gi, '');
  content = content.replace(/\n*Link to.*$/gi, '');
  content = content.replace(/\n*🔵.*$/gi, '');

  return content.trim();
}

interface ArticleContentProps {
  article: {
    id: string; // Telegram ID
    dbId: number; // Database ID for interactions
    title: string;
    excerpt: string;
    content: string;
    date: Date;
    category: string;
    countries: string[];
    link: string;
    imageUrl: string | null;
    videoUrl: string | null;
    views: number;
    likes: number;
    dislikes: number;
  };
  locale: Locale;
  dict: Dictionary;
}

export default function ArticleContent({ article, locale, dict }: ArticleContentProps) {
  const isArabic = locale === 'ar';
  const [showCopied, setShowCopied] = useState(false);
  const supabase = getClient();

  useEffect(() => {
    // Increment view count
    const incrementView = async () => {
      // Check session storage to prevent duplicate counts in same session
      const storageKey = `viewed_${article.dbId}`;
      if (sessionStorage.getItem(storageKey)) return;

      try {
        await supabase.rpc('increment_view_count', { p_article_id: article.dbId });
        sessionStorage.setItem(storageKey, 'true');
      } catch (err) {
        console.error('Failed to increment view count:', err);
      }
    };

    incrementView();
  }, [article.dbId, supabase]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Process and sanitize content
  const processedContent = useMemo(() => {
    const processed = processContent(article.content, article.title);
    // Sanitize HTML to prevent XSS
    return typeof window !== 'undefined'
      ? DOMPurify.sanitize(processed, { ALLOWED_TAGS: ['strong', 'em', 'br'] })
      : processed;
  }, [article.content, article.title]);

  // Format content into paragraphs
  const paragraphs = processedContent
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
            <span className="flex items-center gap-1.5 text-sm text-slate-dark border-l border-midnight-600 pl-3 ml-1">
              <Eye className="h-4 w-4" aria-hidden="true" />
              {article.views + 1} {/* Optimistic update */}
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

        {/* Hero Media */}
        {(article.imageUrl || article.videoUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 sm:mb-12"
          >
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
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Article content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          {paragraphs.map((paragraph, index) => {
            // Strip HTML tags for text analysis
            const plainText = paragraph.replace(/<[^>]+>/g, '');

            // Check if it's a section header (Roman numerals, numbered, or short bold text)
            const isHeader =
              /^[IVX]+\.\s/.test(plainText) ||
              /^\d+\.\s/.test(plainText) ||
              (plainText.length < 80 && paragraph.startsWith('<strong>') && paragraph.endsWith('</strong>'));

            // Skip footer content and empty paragraphs
            if (
              plainText.includes("@observer") ||
              plainText.includes("@almuraqb") ||
              plainText.startsWith("Link to") ||
              plainText.startsWith("🔵") ||
              plainText.length < 3
            ) {
              return null;
            }

            if (isHeader) {
              return (
                <h2
                  key={index}
                  className="font-heading text-xl font-bold text-slate-light mt-8 mb-4"
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              );
            }

            return (
              <p
                key={index}
                className="text-slate-medium leading-relaxed mb-4 text-base sm:text-lg [&>strong]:text-slate-light [&>strong]:font-semibold [&>em]:italic"
                dangerouslySetInnerHTML={{ __html: paragraph }}
              />
            );
          })}
        </motion.div>

        {/* Interactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ArticleInteractions articleId={article.dbId} locale={locale} />
        </motion.div>
      </div>
    </article>
  );
}
