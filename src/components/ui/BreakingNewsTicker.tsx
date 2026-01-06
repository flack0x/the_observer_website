"use client";

import { useMemo, useRef, memo } from "react";
import { useBreakingNews } from "@/lib/hooks";
import type { Locale, Dictionary } from "@/lib/i18n";

interface NewsItem {
  category: string;
  title: string;
}

interface BreakingNewsTickerProps {
  locale?: Locale;
  dict: Dictionary;
}

// Memoized ticker track to prevent animation restart on parent re-renders
const TickerTrack = memo(function TickerTrack({ items }: { items: NewsItem[] }) {
  return (
    <div className="ticker-track">
      {/* First set */}
      {items.map((item, index) => (
        <span key={`a-${index}`} className="ticker-item">
          <span className="ticker-category">{item.category}</span>
          <span className="ticker-title">{item.title}</span>
          <span className="ticker-separator">—</span>
        </span>
      ))}
      {/* Duplicate for seamless loop */}
      {items.map((item, index) => (
        <span key={`b-${index}`} className="ticker-item">
          <span className="ticker-category">{item.category}</span>
          <span className="ticker-title">{item.title}</span>
          <span className="ticker-separator">—</span>
        </span>
      ))}
    </div>
  );
});

export default function BreakingNewsTicker({ locale = 'en', dict }: BreakingNewsTickerProps) {
  const { breakingNews, loading } = useBreakingNews(locale);
  const fallbackNews = dict.ticker.fallbackNews as NewsItem[];

  // Track if we've ever loaded real data
  const hasLoadedRef = useRef(false);
  const cachedNewsRef = useRef<NewsItem[]>(fallbackNews);

  // Memoize news items to prevent unnecessary re-renders
  const newsItems = useMemo(() => {
    // If still loading and never loaded before, use fallback
    if (loading && !hasLoadedRef.current) {
      return fallbackNews;
    }

    // If we have real data, parse and cache it
    if (!loading && breakingNews.length > 0) {
      hasLoadedRef.current = true;
      cachedNewsRef.current = breakingNews.map((item) => {
        const colonIndex = item.indexOf(":");
        if (colonIndex > 0) {
          return {
            category: item.substring(0, colonIndex).trim(),
            title: item.substring(colonIndex + 1).trim(),
          };
        }
        return { category: "INTEL", title: item };
      });
    }

    // Return cached news (either real data or fallback)
    return cachedNewsRef.current;
  }, [breakingNews, loading, fallbackNews]);

  return (
    <div className="relative h-7 bg-midnight-900 border-b border-midnight-700/50">
      <div className="flex h-full items-center">
        {/* Live Indicator - Compact */}
        <div className="relative z-10 flex h-full shrink-0 items-center bg-tactical-red px-2.5 sm:px-3 gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          <span className="font-heading text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white">
            {dict.ticker.live}
          </span>
        </div>

        {/* Ticker Content */}
        <div className="ticker-container">
          <TickerTrack items={newsItems} />
        </div>
      </div>
    </div>
  );
}
