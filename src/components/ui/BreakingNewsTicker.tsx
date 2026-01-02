"use client";

import { Radio } from "lucide-react";
import { useBreakingNews } from "@/lib/hooks";

// Category colors
const categoryColors: Record<string, { bg: string; text: string }> = {
  MILITARY: { bg: "bg-red-600", text: "text-white" },
  BREAKING: { bg: "bg-red-600", text: "text-white" },
  POLITICAL: { bg: "bg-amber-500", text: "text-black" },
  ECONOMIC: { bg: "bg-green-600", text: "text-white" },
  INTELLIGENCE: { bg: "bg-blue-500", text: "text-white" },
  DIPLOMATIC: { bg: "bg-purple-500", text: "text-white" },
  ANALYSIS: { bg: "bg-amber-500", text: "text-black" },
};

const defaultColor = { bg: "bg-slate-600", text: "text-white" };

interface NewsItem {
  category: string;
  title: string;
}

// Fallback news while loading
const fallbackNews: NewsItem[] = [
  { category: "BREAKING", title: "Egypt-Israel $35B gas deal signals new economic dependency dynamics" },
  { category: "POLITICAL", title: "Regional powers reassess strategic alignments amid shifting alliances" },
  { category: "MILITARY", title: "New defense systems deployed across contested maritime zones" },
  { category: "INTELLIGENCE", title: "Covert operations exposed in declassified agency documents" },
  { category: "ECONOMIC", title: "Sanctions impact analysis reveals unexpected market adaptations" },
];

export default function BreakingNewsTicker() {
  const { breakingNews, loading } = useBreakingNews();

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
    <div className="relative z-50 h-9 bg-midnight-900 border-b border-midnight-700">
      <div className="flex h-full items-center">
        {/* Live Label */}
        <div className="relative z-10 flex h-full shrink-0 items-center bg-tactical-red">
          <div className="flex items-center gap-2 px-4">
            <span className="ticker-pulse">
              <Radio className="h-3 w-3 text-white" />
            </span>
            <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-white">
              Live
            </span>
          </div>
          <div className="h-full w-4 bg-tactical-red skew-x-12 -mr-2" />
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
