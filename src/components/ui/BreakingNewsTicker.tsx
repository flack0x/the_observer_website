"use client";

import { Radio } from "lucide-react";
import { useBreakingNews } from "@/lib/hooks";
import type { Locale, Dictionary } from "@/lib/i18n";

// Category colors
const categoryColors: Record<string, { bg: string; text: string }> = {
  MILITARY: { bg: "bg-red-600", text: "text-white" },
  BREAKING: { bg: "bg-red-600", text: "text-white" },
  POLITICAL: { bg: "bg-amber-500", text: "text-black" },
  ECONOMIC: { bg: "bg-green-600", text: "text-white" },
  INTELLIGENCE: { bg: "bg-blue-500", text: "text-white" },
  DIPLOMATIC: { bg: "bg-purple-500", text: "text-white" },
  ANALYSIS: { bg: "bg-amber-500", text: "text-black" },
  // Arabic categories
  'عسكري': { bg: "bg-red-600", text: "text-white" },
  'عاجل': { bg: "bg-red-600", text: "text-white" },
  'سياسي': { bg: "bg-amber-500", text: "text-black" },
  'اقتصادي': { bg: "bg-green-600", text: "text-white" },
  'استخباراتي': { bg: "bg-blue-500", text: "text-white" },
  'دبلوماسي': { bg: "bg-purple-500", text: "text-white" },
  'تحليل': { bg: "bg-amber-500", text: "text-black" },
};

const defaultColor = { bg: "bg-slate-600", text: "text-white" };

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
    <div className="relative z-50 h-9 bg-tactical-red border-b border-tactical-red-hover">
      <div className="flex h-full items-center">
        {/* Live Label */}
        <div className="relative z-10 flex h-full shrink-0 items-center bg-red-600">
          <div className="flex items-center gap-2 px-4">
            <span className="ticker-pulse">
              <Radio className="h-3 w-3 text-white" />
            </span>
            <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-white">
              {dict.ticker.live}
            </span>
          </div>
          <div className="h-full w-4 bg-red-600 skew-x-12 -mr-2" />
        </div>

        {/* Ticker */}
        <div className="ticker-container">
          <div className="ticker-track">
            {/* First set */}
            {newsItems.map((item, index) => {
              const colors = categoryColors[item.category] || defaultColor;
              return (
                <span key={`a-${index}`} className="ticker-item">
                  <span className={`ticker-category ${colors.bg} ${colors.text}`}>
                    {item.category}
                  </span>
                  <span className="ticker-title">{item.title}</span>
                  <span className="ticker-separator">●</span>
                </span>
              );
            })}
            {/* Duplicate for seamless loop */}
            {newsItems.map((item, index) => {
              const colors = categoryColors[item.category] || defaultColor;
              return (
                <span key={`b-${index}`} className="ticker-item">
                  <span className={`ticker-category ${colors.bg} ${colors.text}`}>
                    {item.category}
                  </span>
                  <span className="ticker-title">{item.title}</span>
                  <span className="ticker-separator">●</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
