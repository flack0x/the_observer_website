"use client";

import { motion } from "framer-motion";
import { Crosshair, ArrowRight, Activity, TrendingUp, Building2, Radio, Smile, Meh, Frown } from "lucide-react";
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

  // Get sentiment data
  const sentiment = metrics?.sentiment?.percentages || { positive: 0, neutral: 0, negative: 0 };
  const totalSentiment = sentiment.positive + sentiment.neutral + sentiment.negative;

  // Get trending topics (top 5)
  const trending = metrics?.trending?.slice(0, 5) || [];

  // Get top organizations (top 5)
  const organizations = metrics?.organizations
    ? Object.entries(metrics.organizations)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];

  const maxOrgCount = organizations.length > 0 ? organizations[0][1] : 1;

  return (
    <section
      className="border-t border-midnight-700 bg-midnight-800 py-12 sm:py-20"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-start">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: isArabic ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-5 sm:mb-6 flex items-center gap-3 sm:gap-4">
              <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-tactical-red/10">
                <Radio className="h-5 w-5 sm:h-6 sm:w-6 text-tactical-red" aria-hidden="true" />
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

            {/* Sentiment Analysis Preview */}
            <div className="mb-6 sm:mb-8 rounded-xl border border-midnight-600 bg-midnight-700/30 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-heading text-xs sm:text-sm uppercase tracking-wider text-slate-light">
                  {dict.situationPreview.sentimentAnalysis || 'Content Sentiment'}
                </span>
                <Activity className="h-4 w-4 text-slate-dark" aria-hidden="true" />
              </div>

              {loading ? (
                <div className="space-y-3">
                  <div className="h-3 bg-midnight-600 rounded animate-pulse" />
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-midnight-600 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-midnight-600 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-midnight-600 rounded animate-pulse" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Sentiment Bar */}
                  <div className="h-4 rounded-full overflow-hidden flex bg-midnight-800 mb-3">
                    {totalSentiment > 0 && (
                      <>
                        <motion.div
                          className="h-full bg-earth-olive"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(sentiment.positive / totalSentiment) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6 }}
                        />
                        <motion.div
                          className="h-full bg-slate-dark"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(sentiment.neutral / totalSentiment) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                        />
                        <motion.div
                          className="h-full bg-tactical-red"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(sentiment.negative / totalSentiment) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        />
                      </>
                    )}
                  </div>

                  {/* Sentiment Labels */}
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Smile className="h-3.5 w-3.5 text-earth-olive" />
                      <span className="text-slate-medium">
                        {isArabic ? toArabicNumerals(Math.round(sentiment.positive)) : Math.round(sentiment.positive)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Meh className="h-3.5 w-3.5 text-slate-dark" />
                      <span className="text-slate-medium">
                        {isArabic ? toArabicNumerals(Math.round(sentiment.neutral)) : Math.round(sentiment.neutral)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Frown className="h-3.5 w-3.5 text-tactical-red" />
                      <span className="text-slate-medium">
                        {isArabic ? toArabicNumerals(Math.round(sentiment.negative)) : Math.round(sentiment.negative)}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              href={`/${locale}/situation-room`}
              className="group inline-flex items-center gap-2 rounded-lg bg-tactical-red px-4 py-2.5 sm:px-6 sm:py-3 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover"
            >
              <Crosshair className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              {dict.situationPreview.enterRoom}
              <ArrowRight className={`h-4 w-4 transition-transform ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Analytics Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: isArabic ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-2xl border border-midnight-600 bg-midnight-900 overflow-hidden">
              {/* Panel Header */}
              <div className="flex items-center justify-between border-b border-midnight-700 px-4 py-3 bg-midnight-800/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-tactical-red" />
                    <div className="h-2 w-2 rounded-full bg-tactical-amber" />
                    <div className="h-2 w-2 rounded-full bg-earth-olive" />
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-slate-dark uppercase tracking-wider">
                    {dict.situationPreview.analyticsPreview || 'Analytics Preview'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-tactical-red animate-pulse" aria-hidden="true" />
                  <span className="font-mono text-[10px] text-tactical-red">
                    {dict.situationPreview.active}
                  </span>
                </div>
              </div>

              {/* Trending Topics */}
              <div className="p-4 border-b border-midnight-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading text-[10px] sm:text-xs uppercase tracking-wider text-slate-dark">
                    {dict.situationPreview.trendingTopics || 'Trending Topics'}
                  </span>
                  <TrendingUp className="h-3 w-3 text-slate-dark" aria-hidden="true" />
                </div>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-6 bg-midnight-700 rounded animate-pulse" style={{ width: `${100 - i * 10}%` }} />
                    ))}
                  </div>
                ) : trending.length > 0 ? (
                  <div className="space-y-2">
                    {trending.map((topic, index) => (
                      <motion.div
                        key={topic.topic}
                        initial={{ opacity: 0, x: isArabic ? 10 : -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between py-1.5 px-2 rounded bg-midnight-800/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-tactical-red font-bold">
                            #{isArabic ? toArabicNumerals(index + 1) : index + 1}
                          </span>
                          <span className="font-mono text-xs text-slate-light truncate max-w-[140px] sm:max-w-[180px]">
                            {topic.topic}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-dark">
                          {isArabic ? toArabicNumerals(topic.mentions) : topic.mentions} {dict.situationPreview.mentions || 'mentions'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-dark">
                    {dict.common.noData || 'No data available'}
                  </div>
                )}
              </div>

              {/* Key Organizations */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading text-[10px] sm:text-xs uppercase tracking-wider text-slate-dark">
                    {dict.situationPreview.keyOrganizations || 'Key Organizations'}
                  </span>
                  <Building2 className="h-3 w-3 text-slate-dark" aria-hidden="true" />
                </div>
                {loading ? (
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-6 w-16 bg-midnight-700 rounded-full animate-pulse" />
                    ))}
                  </div>
                ) : organizations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {organizations.map(([org, count], index) => {
                      const intensity = count / maxOrgCount;
                      const bgOpacity = 0.2 + (intensity * 0.4);
                      return (
                        <motion.div
                          key={org}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-midnight-600"
                          style={{ backgroundColor: `rgba(220, 38, 38, ${bgOpacity})` }}
                        >
                          <span className="font-mono text-[10px] sm:text-xs text-slate-light">
                            {org}
                          </span>
                          <span className="font-mono text-[9px] text-slate-dark">
                            ({isArabic ? toArabicNumerals(count) : count})
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-dark">
                    {dict.common.noData || 'No data available'}
                  </div>
                )}
              </div>
            </div>

            {/* Corner Accents */}
            <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-tactical-red/30 rounded-tl" />
            <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-tactical-red/30 rounded-tr" />
            <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-tactical-red/30 rounded-bl" />
            <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-tactical-red/30 rounded-br" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
