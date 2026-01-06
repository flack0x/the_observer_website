"use client";

import { motion } from "framer-motion";
import { Map, Crosshair, ArrowRight, Activity, BarChart3, Globe, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useMetrics } from "@/lib/hooks";
import type { Locale, Dictionary } from "@/lib/i18n";

interface SituationRoomPreviewProps {
  locale: Locale;
  dict: Dictionary;
}

// Convert number to Arabic numerals
function toArabicNumerals(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).split('').map(d => arabicNumerals[parseInt(d)] || d).join('');
}

export default function SituationRoomPreview({ locale, dict }: SituationRoomPreviewProps) {
  const isArabic = locale === 'ar';
  const { metrics, loading } = useMetrics();

  // Build dynamic stats from real metrics
  const dynamicStats = [
    {
      name: dict.situationPreview.articles,
      count: metrics?.total_articles || 0,
      color: "bg-tactical-red",
      icon: BarChart3,
    },
    {
      name: dict.situationPreview.regions,
      count: Object.keys(metrics?.countries || {}).length,
      color: "bg-tactical-amber",
      icon: Globe,
    },
    {
      name: dict.situationPreview.trending,
      count: metrics?.trending?.length || 0,
      color: "bg-earth-olive",
      icon: TrendingUp,
    },
  ];

  return (
    <section
      className="border-t border-midnight-700 bg-midnight-800 py-12 sm:py-20"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: isArabic ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-5 sm:mb-6 flex items-center gap-3 sm:gap-4">
              <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-tactical-red/10">
                <Map className="h-5 w-5 sm:h-6 sm:w-6 text-tactical-red" aria-hidden="true" />
                <motion.div
                  className="absolute inset-0 rounded-lg border border-tactical-red/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-light">
                  {dict.situationPreview.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-dark">
                  {dict.situationPreview.subtitle}
                </p>
              </div>
            </div>

            <p className="mb-6 sm:mb-8 font-body text-base sm:text-lg leading-relaxed text-slate-medium">
              {dict.situationPreview.description}
            </p>

            {/* Dynamic Stats */}
            <div className="mb-6 sm:mb-8 space-y-2 sm:space-y-3">
              {dynamicStats.map((stat, index) => (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border border-midnight-600 bg-midnight-700 px-3 py-2.5 sm:px-4 sm:py-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${stat.color}`} />
                    <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-dark" aria-hidden="true" />
                    <span className="font-heading text-xs sm:text-sm uppercase tracking-wider text-slate-light">
                      {stat.name}
                    </span>
                  </div>
                  {loading ? (
                    <div className="h-5 w-16 sm:w-20 bg-midnight-600 rounded animate-pulse" />
                  ) : (
                    <span className="rounded bg-midnight-600 px-2 py-0.5 font-mono text-[10px] sm:text-xs text-slate-medium">
                      {isArabic ? toArabicNumerals(stat.count) : stat.count} {dict.situationPreview.active}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            <Link
              href={`/${locale}/situation-room`}
              className={`group inline-flex items-center gap-2 rounded-lg bg-tactical-red px-4 py-2.5 sm:px-6 sm:py-3 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover`}
            >
              <Crosshair className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              {dict.situationPreview.enterRoom}
              <ArrowRight className={`h-4 w-4 transition-transform ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Map Preview */}
          <motion.div
            initial={{ opacity: 0, x: isArabic ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-midnight-600 bg-midnight-900">
              {/* Grid Background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(27, 58, 87, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(27, 58, 87, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Radar Sweep Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, rgba(27, 58, 87, 0.25) 30deg, transparent 60deg)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Map Points */}
              <div className="absolute inset-0 p-8">
                {/* Simulated map points */}
                <motion.div
                  className="absolute left-[20%] top-[30%]"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative">
                    <div className="h-3 w-3 rounded-full bg-tactical-red" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-tactical-red opacity-50" />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute right-[25%] top-[40%]"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="relative">
                    <div className="h-3 w-3 rounded-full bg-tactical-amber" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-tactical-amber opacity-50" />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute left-[45%] bottom-[25%]"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <div className="relative">
                    <div className="h-3 w-3 rounded-full bg-earth-olive" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-earth-olive opacity-50" />
                  </div>
                </motion.div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 h-full w-full">
                  <line
                    x1="20%"
                    y1="30%"
                    x2="75%"
                    y2="40%"
                    stroke="rgba(27, 58, 87, 0.4)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="75%"
                    y1="40%"
                    x2="45%"
                    y2="75%"
                    stroke="rgba(212, 175, 55, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Overlay UI */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-midnight-600 bg-midnight-800/90 px-3 py-2 sm:px-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-tactical-red" aria-hidden="true" />
                  <span className="font-mono text-[10px] sm:text-xs text-slate-light">
                    {dict.situationPreview.liveFeed}
                  </span>
                </div>
                {loading ? (
                  <div className="h-4 w-24 bg-midnight-600 rounded animate-pulse" />
                ) : (
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="font-mono text-[10px] sm:text-xs text-slate-dark">
                      {isArabic ? toArabicNumerals(metrics?.total_articles || 0) : metrics?.total_articles || 0} {dict.situationPreview.articles}
                    </span>
                    <span className="font-mono text-[10px] sm:text-xs text-slate-dark">
                      {isArabic ? toArabicNumerals(Object.keys(metrics?.countries || {}).length) : Object.keys(metrics?.countries || {}).length} {dict.situationPreview.regions}
                    </span>
                  </div>
                )}
              </div>

              {/* Corner Markers */}
              <div className="absolute left-2 top-2 h-6 w-6 border-l-2 border-t-2 border-tactical-red/50" />
              <div className="absolute right-2 top-2 h-6 w-6 border-r-2 border-t-2 border-tactical-red/50" />
              <div className="absolute bottom-2 left-2 h-6 w-6 border-b-2 border-l-2 border-tactical-red/50" />
              <div className="absolute bottom-2 right-2 h-6 w-6 border-b-2 border-r-2 border-tactical-red/50" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
