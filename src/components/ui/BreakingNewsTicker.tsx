"use client";

import { Radio } from "lucide-react";
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

export default function BreakingNewsTicker({ locale = 'en', dict }: BreakingNewsTickerProps) {
  const { breakingNews, loading } = useBreakingNews(locale);
  const fallbackNews = dict.ticker.fallbackNews as NewsItem[];

  // Parse breaking news into structured format
  const newsItems: NewsItem[] = loading || breakingNews.length === 0
    ? fallbackNews
    : breakingNews.map((item) => {
        const colonIndex = item.indexOf(":");
        if (colonIndex > 0) {
          return {
            category: item.substring(0, colonIndex).trim(),
            title: item.substring(colonIndex + 1).trim(),
          };
        }
        return { category: "INTEL", title: item };
      });

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
          <div className="ticker-track">
            {/* First set */}
            {newsItems.map((item, index) => (
              <span key={`a-${index}`} className="ticker-item">
                <span className="ticker-category">
                  {item.category}
                </span>
                <span className="ticker-title">{item.title}</span>
                <span className="ticker-separator">—</span>
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {newsItems.map((item, index) => (
              <span key={`b-${index}`} className="ticker-item">
                <span className="ticker-category">
                  {item.category}
                </span>
                <span className="ticker-title">{item.title}</span>
                <span className="ticker-separator">—</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
