"use client";

import { useState, useEffect, memo } from "react";
import type { Locale, Dictionary } from "@/lib/i18n";

interface NewsItem {
  category: string;
  title: string;
}

interface BreakingNewsTickerProps {
  locale?: Locale;
  dict: Dictionary;
  initialNews: string[];
}

// Parse news string into structured format
function parseNewsItem(item: string): NewsItem {
  const colonIndex = item.indexOf(":");
  if (colonIndex > 0) {
    return {
      category: item.substring(0, colonIndex).trim(),
      title: item.substring(colonIndex + 1).trim(),
    };
  }
  return { category: "INTEL", title: item };
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
          <span className="ticker-separator">
            <span className="ticker-separator-line" />
            <span className="ticker-separator-dot" />
            <span className="ticker-separator-line" />
          </span>
        </span>
      ))}
      {/* Duplicate for seamless loop */}
      {items.map((item, index) => (
        <span key={`b-${index}`} className="ticker-item">
          <span className="ticker-category">{item.category}</span>
          <span className="ticker-title">{item.title}</span>
          <span className="ticker-separator">
            <span className="ticker-separator-line" />
            <span className="ticker-separator-dot" />
            <span className="ticker-separator-line" />
          </span>
        </span>
      ))}
    </div>
  );
});

export default function BreakingNewsTicker({ locale, dict, initialNews }: BreakingNewsTickerProps) {
  // Start with initial news (server-rendered), then fetch fresh shuffled order
  const [newsItems, setNewsItems] = useState<NewsItem[] | null>(() => {
    if (initialNews.length === 0) return null;
    return initialNews.map(parseNewsItem);
  });

  // Fetch fresh shuffled headlines on mount
  useEffect(() => {
    const language = locale === 'ar' ? 'ar' : 'en';
    fetch(`/api/headlines?language=${language}&format=ticker&limit=30`)
      .then(res => res.json())
      .then((data: string[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setNewsItems(data.map(parseNewsItem));
        }
      })
      .catch(() => {
        // Keep initial news on error
      });
  }, [locale]);

  // Don't render ticker if no news available
  if (!newsItems) {
    return null;
  }

  return (
    <div className="ticker-wrapper relative h-7 bg-midnight-900 border-b border-midnight-700/50">
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
