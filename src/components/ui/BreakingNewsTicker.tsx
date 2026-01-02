"use client";

import { AlertTriangle, Radio } from "lucide-react";
import { useBreakingNews } from "@/lib/hooks";

// Fallback news while loading
const fallbackNews = [
  "BREAKING: Egypt-Israel $35B gas deal signals new economic dependency dynamics",
  "ALERT: Trump grants Israel 'sovereignty rights' over occupied Golan Heights",
  "ANALYSIS: AI-driven targeting systems deployed in Gaza operations exposed",
  "INTEL: Iraq PMF weapons monopoly demands raise strategic concerns",
  "REPORT: Houthi forces declare Israeli presence in Somaliland a military target",
];

export default function BreakingNewsTicker() {
  const { breakingNews, loading } = useBreakingNews();
  const news = loading || breakingNews.length === 0 ? fallbackNews : breakingNews;

  return (
    <div className="relative z-50 h-8 bg-tactical-red border-b border-tactical-red-hover">
      <div className="flex h-full items-center">
        {/* Breaking Label - extends to left edge */}
        <div className="relative z-10 flex h-full shrink-0 items-center bg-midnight-900">
          <div className="flex items-center gap-2 px-4">
            <span className="ticker-pulse">
              <Radio className="h-3 w-3 text-tactical-red" />
            </span>
            <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-tactical-red">
              Breaking
            </span>
          </div>
          {/* Angled edge for style */}
          <div className="h-full w-4 bg-midnight-900 -skew-x-12 -mr-2" />
        </div>

        {/* Ticker Content - CSS-only animation for smooth performance */}
        <div className="ticker-container">
          <div className="ticker-track">
            {/* First set */}
            {news.map((item, index) => (
              <div key={`a-${index}`} className="ticker-item">
                <span className="px-6 font-heading text-[10px] font-medium uppercase tracking-wide text-white">
                  {item}
                </span>
                <AlertTriangle className="h-2.5 w-2.5 text-white/60 flex-shrink-0" />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {news.map((item, index) => (
              <div key={`b-${index}`} className="ticker-item">
                <span className="px-6 font-heading text-[10px] font-medium uppercase tracking-wide text-white">
                  {item}
                </span>
                <AlertTriangle className="h-2.5 w-2.5 text-white/60 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
