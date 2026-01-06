"use client";

import { motion } from "framer-motion";
import { Crosshair, ArrowRight, Activity, TrendingUp, MapPin, FileText, Radio } from "lucide-react";
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

// Country name translations for display
const countryNames: Record<string, { en: string; ar: string }> = {
  'united states': { en: 'United States', ar: 'الولايات المتحدة' },
  'usa': { en: 'United States', ar: 'الولايات المتحدة' },
  'russia': { en: 'Russia', ar: 'روسيا' },
  'china': { en: 'China', ar: 'الصين' },
  'iran': { en: 'Iran', ar: 'إيران' },
  'israel': { en: 'Israel', ar: 'إسرائيل' },
  'ukraine': { en: 'Ukraine', ar: 'أوكرانيا' },
  'syria': { en: 'Syria', ar: 'سوريا' },
  'yemen': { en: 'Yemen', ar: 'اليمن' },
  'lebanon': { en: 'Lebanon', ar: 'لبنان' },
  'palestine': { en: 'Palestine', ar: 'فلسطين' },
  'gaza': { en: 'Gaza', ar: 'غزة' },
  'iraq': { en: 'Iraq', ar: 'العراق' },
  'turkey': { en: 'Turkey', ar: 'تركيا' },
  'saudi arabia': { en: 'Saudi Arabia', ar: 'السعودية' },
  'egypt': { en: 'Egypt', ar: 'مصر' },
  'venezuela': { en: 'Venezuela', ar: 'فنزويلا' },
  'north korea': { en: 'North Korea', ar: 'كوريا الشمالية' },
  'taiwan': { en: 'Taiwan', ar: 'تايوان' },
  'europe': { en: 'Europe', ar: 'أوروبا' },
};

function getCountryDisplayName(country: string, locale: Locale): string {
  const key = country.toLowerCase();
  return countryNames[key]?.[locale] || country;
}

// Category colors
const categoryColors: Record<string, string> = {
  'military': '#dc2626',
  'political': '#d97706',
  'breaking': '#ef4444',
  'intelligence': '#6366f1',
  'economic': '#22c55e',
  'diplomatic': '#0ea5e9',
  'analysis': '#8b5cf6',
};

export default function SituationRoomPreview({ locale, dict }: SituationRoomPreviewProps) {
  const isArabic = locale === 'ar';
  const { metrics, loading } = useMetrics();

  // Get top 5 regions from real data
  const topRegions = metrics?.countries
    ? Object.entries(metrics.countries)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];

  const maxRegionCount = topRegions.length > 0 ? topRegions[0][1] : 1;

  // Get category distribution
  const categories = metrics?.categories
    ? Object.entries(metrics.categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
    : [];

  const totalCategoryCount = categories.reduce((sum, [, count]) => sum + count, 0);

  // Get daily trend for sparkline
  const dailyTrend = metrics?.temporal?.daily_trend?.slice(-7) || [];
  const maxTrend = Math.max(...dailyTrend.map(d => d.count), 1);

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

            {/* Key Stats Row */}
            <div className="mb-6 sm:mb-8 grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-lg border border-midnight-600 bg-midnight-700/50 p-3 sm:p-4 text-center">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-tactical-red mx-auto mb-1" aria-hidden="true" />
                {loading ? (
                  <div className="h-6 w-12 bg-midnight-600 rounded animate-pulse mx-auto" />
                ) : (
                  <div className="font-heading text-lg sm:text-2xl font-bold text-slate-light">
                    {isArabic ? toArabicNumerals(metrics?.total_articles || 0) : metrics?.total_articles || 0}
                  </div>
                )}
                <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-dark">
                  {dict.situationPreview.articles}
                </div>
              </div>
              <div className="rounded-lg border border-midnight-600 bg-midnight-700/50 p-3 sm:p-4 text-center">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-tactical-amber mx-auto mb-1" aria-hidden="true" />
                {loading ? (
                  <div className="h-6 w-12 bg-midnight-600 rounded animate-pulse mx-auto" />
                ) : (
                  <div className="font-heading text-lg sm:text-2xl font-bold text-slate-light">
                    {isArabic ? toArabicNumerals(Object.keys(metrics?.countries || {}).length) : Object.keys(metrics?.countries || {}).length}
                  </div>
                )}
                <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-dark">
                  {dict.situationPreview.regions}
                </div>
              </div>
              <div className="rounded-lg border border-midnight-600 bg-midnight-700/50 p-3 sm:p-4 text-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-earth-olive mx-auto mb-1" aria-hidden="true" />
                {loading ? (
                  <div className="h-6 w-12 bg-midnight-600 rounded animate-pulse mx-auto" />
                ) : (
                  <div className="font-heading text-lg sm:text-2xl font-bold text-slate-light">
                    {isArabic ? toArabicNumerals(metrics?.temporal?.articles_this_week || 0) : metrics?.temporal?.articles_this_week || 0}
                  </div>
                )}
                <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-dark">
                  {dict.situationPreview.thisWeek || 'This Week'}
                </div>
              </div>
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

          {/* Data Preview Panel */}
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
                    {dict.situationPreview.liveFeed || 'Live Feed'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-tactical-red animate-pulse" aria-hidden="true" />
                  <span className="font-mono text-[10px] text-tactical-red">
                    {dict.situationPreview.active || 'ACTIVE'}
                  </span>
                </div>
              </div>

              {/* Top Regions */}
              <div className="p-4 border-b border-midnight-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading text-[10px] sm:text-xs uppercase tracking-wider text-slate-dark">
                    {dict.situationPreview.topRegions || 'Top Regions'}
                  </span>
                  <MapPin className="h-3 w-3 text-slate-dark" aria-hidden="true" />
                </div>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-4 bg-midnight-700 rounded animate-pulse" style={{ width: `${100 - i * 15}%` }} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topRegions.map(([region, count], index) => (
                      <div key={region} className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-dark w-4 text-right">
                          {isArabic ? toArabicNumerals(index + 1) : index + 1}
                        </span>
                        <div className="flex-1 h-5 bg-midnight-800 rounded overflow-hidden relative">
                          <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-tactical-red/80 to-tactical-red/40 rounded"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(count / maxRegionCount) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                          />
                          <span className="absolute inset-0 flex items-center px-2 font-mono text-[10px] text-slate-light">
                            {getCountryDisplayName(region, locale)}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-dark w-6 text-right">
                          {isArabic ? toArabicNumerals(count) : count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Distribution */}
              <div className="p-4 border-b border-midnight-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading text-[10px] sm:text-xs uppercase tracking-wider text-slate-dark">
                    {dict.situationPreview.categories || 'Categories'}
                  </span>
                  <FileText className="h-3 w-3 text-slate-dark" aria-hidden="true" />
                </div>
                {loading ? (
                  <div className="h-3 bg-midnight-700 rounded animate-pulse" />
                ) : (
                  <>
                    <div className="h-3 rounded-full overflow-hidden flex bg-midnight-800">
                      {categories.map(([category, count], index) => (
                        <motion.div
                          key={category}
                          className="h-full"
                          style={{ backgroundColor: categoryColors[category.toLowerCase()] || '#64748b' }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(count / totalCategoryCount) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {categories.slice(0, 4).map(([category]) => (
                        <div key={category} className="flex items-center gap-1">
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: categoryColors[category.toLowerCase()] || '#64748b' }}
                          />
                          <span className="font-mono text-[9px] text-slate-dark capitalize">
                            {category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Activity Sparkline */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading text-[10px] sm:text-xs uppercase tracking-wider text-slate-dark">
                    {dict.situationPreview.weeklyActivity || '7-Day Activity'}
                  </span>
                  <TrendingUp className="h-3 w-3 text-slate-dark" aria-hidden="true" />
                </div>
                {loading ? (
                  <div className="h-12 bg-midnight-700 rounded animate-pulse" />
                ) : (
                  <div className="h-12 flex items-end gap-1">
                    {dailyTrend.map((day, index) => (
                      <motion.div
                        key={day.date}
                        className="flex-1 bg-gradient-to-t from-tactical-red/80 to-tactical-red/40 rounded-t"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${(day.count / maxTrend) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        style={{ minHeight: day.count > 0 ? '4px' : '0' }}
                      />
                    ))}
                  </div>
                )}
                {!loading && dailyTrend.length > 0 && (
                  <div className="mt-1 flex justify-between">
                    <span className="font-mono text-[8px] text-slate-dark">
                      {new Date(dailyTrend[0]?.date).toLocaleDateString(locale, { weekday: 'short' })}
                    </span>
                    <span className="font-mono text-[8px] text-slate-dark">
                      {new Date(dailyTrend[dailyTrend.length - 1]?.date).toLocaleDateString(locale, { weekday: 'short' })}
                    </span>
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
