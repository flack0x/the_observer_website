"use client";

import { motion } from "framer-motion";
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
  const duplicatedNews = [...news, ...news];

  return (
    <div className="relative z-50 h-8 bg-tactical-red border-b border-tactical-red-hover">
      <div className="flex h-full items-center">
        {/* Breaking Label - extends to left edge */}
        <div className="relative z-10 flex h-full shrink-0 items-center bg-midnight-900">
          <div className="flex items-center gap-2 px-4">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Radio className="h-3 w-3 text-tactical-red" />
            </motion.div>
            <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-tactical-red">
              Breaking
            </span>
          </div>
          {/* Angled edge for style */}
          <div className="h-full w-4 bg-midnight-900 -skew-x-12 -mr-2" />
        </div>

        {/* Ticker Content */}
        <div className="relative flex-1 overflow-hidden h-full">
          <motion.div
            className="flex whitespace-nowrap items-center h-full"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {duplicatedNews.map((news, index) => (
              <div key={index} className="flex items-center">
                <span className="px-6 font-heading text-[10px] font-medium uppercase tracking-wide text-white">
                  {news}
                </span>
                <AlertTriangle className="h-2.5 w-2.5 text-white/60" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
