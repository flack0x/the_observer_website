"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Globe,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import Link from "next/link";
import type { Locale, Dictionary } from "@/lib/i18n";

interface Metrics {
  computed_at: string;
  total_articles: number;
  countries: Record<string, number>;
  organizations: Record<string, number>;
  categories: Record<string, number>;
  temporal: {
    articles_today: number;
    articles_this_week: number;
    daily_trend: { date: string; count: number }[];
  };
  sentiment: {
    percentages: Record<string, number>;
  };
  trending: { topic: string; mentions: number }[];
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  subValue?: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-midnight-800 rounded-xl p-5 border border-midnight-700"
    >
      <div
        className="inline-flex p-2.5 rounded-lg mb-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="font-heading text-2xl sm:text-3xl font-bold text-slate-light">
        <AnimatedCounter value={value} />
      </div>
      <div className="text-sm text-slate-dark">{label}</div>
      {subValue && <div className="text-xs text-slate-dark mt-1">{subValue}</div>}
    </motion.div>
  );
}

interface IntelDashboardProps {
  locale: Locale;
  dict: Dictionary;
}

const REFRESH_INTERVAL = 60000; // Refresh every 60 seconds

export default function IntelDashboard({ locale, dict }: IntelDashboardProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isArabic = locale === 'ar';

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    // Initial fetch
    fetchMetrics();

    // Set up periodic refresh
    const interval = setInterval(fetchMetrics, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-midnight-800 border-y border-midnight-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-tactical-red" />
        </div>
      </section>
    );
  }

  if (!metrics) {
    return null;
  }

  // Prepare chart data
  const countryData = Object.entries(metrics.countries)
    .slice(0, 6)
    .map(([name, value]) => ({ name: formatLabel(name), value }));

  const trendData = metrics.temporal.daily_trend.slice(-7).map((d) => ({
    date: new Date(d.date).toLocaleDateString(isArabic ? "ar-SA" : "en-US", { weekday: "short" }),
    articles: d.count,
  }));

  const trendingTopics = metrics.trending.slice(0, 5);

  return (
    <section
      className="py-12 sm:py-16 lg:py-20 bg-midnight-800 border-y border-midnight-700"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-midnight-900 border border-midnight-600 mb-4">
              <Activity className="h-4 w-4 text-tactical-red" />
              <span className="text-xs font-heading font-medium uppercase tracking-wider text-slate-medium">
                {dict.home.liveIntelligence}
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-light">
              {dict.home.intelDashboard}
            </h2>
          </div>
          <Link
            href={`/${locale}/situation-room`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-midnight-600 text-sm text-slate-medium hover:border-tactical-red hover:text-tactical-red transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            {dict.home.fullDashboard}
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={BarChart3}
            label={dict.dashboard.totalArticles}
            value={metrics.total_articles}
            color="#B91C1C"
            delay={0}
          />
          <StatCard
            icon={Zap}
            label={dict.dashboard.thisWeek}
            value={metrics.temporal.articles_this_week}
            subValue={`${metrics.temporal.articles_today} ${dict.dashboard.today}`}
            color="#D4AF37"
            delay={0.1}
          />
          <StatCard
            icon={Globe}
            label={dict.dashboard.countries}
            value={Object.keys(metrics.countries).length}
            color="#1B3A57"
            delay={0.2}
          />
          <StatCard
            icon={Users}
            label={dict.dashboard.organizations}
            value={Object.keys(metrics.organizations).length}
            color="#6B7B4C"
            delay={0.3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-midnight-900 rounded-xl p-5 border border-midnight-700"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-tactical-amber" />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                {dict.dashboard.activity7Day}
              </h3>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#B91C1C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#5f6368" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#5f6368" fontSize={10} tickLine={false} axisLine={false} width={25} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="articles"
                    stroke="#B91C1C"
                    strokeWidth={2}
                    fill="url(#colorActivity)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-midnight-900 rounded-xl p-5 border border-midnight-700"
          >
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-tactical-red" />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                {dict.dashboard.topRegions}
              </h3>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData} layout="vertical">
                  <XAxis type="number" stroke="#5f6368" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#5f6368"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="#B91C1C" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Trending */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-midnight-900 rounded-xl p-5 border border-midnight-700"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-tactical-amber" />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                {dict.dashboard.trendingNow}
              </h3>
            </div>
            <div className="space-y-3">
              {trendingTopics.map((topic, i) => {
                const maxMentions = trendingTopics[0]?.mentions || 1;
                const width = (topic.mentions / maxMentions) * 100;
                return (
                  <div key={topic.topic} className="relative">
                    <div className="flex items-center justify-between relative z-10 py-1.5 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-dark">#{i + 1}</span>
                        <span className="text-sm text-slate-light">{formatLabel(topic.topic)}</span>
                      </div>
                      <span className="text-xs font-mono text-tactical-amber">{topic.mentions}</span>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${width}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1 * i }}
                      className={`absolute inset-y-0 rounded bg-tactical-red/10 ${isArabic ? 'right-0' : 'left-0'}`}
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Sentiment Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-midnight-900 rounded-xl p-5 border border-midnight-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
              {dict.dashboard.contentSentiment}
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                {dict.dashboard.negative} {metrics.sentiment.percentages.negative}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {dict.dashboard.neutral} {metrics.sentiment.percentages.neutral}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                {dict.dashboard.positive} {metrics.sentiment.percentages.positive}%
              </span>
            </div>
          </div>
          <div className="h-3 rounded-full bg-midnight-700 overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${metrics.sentiment.percentages.negative}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="h-full bg-red-600"
            />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${metrics.sentiment.percentages.neutral}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-amber-500"
            />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${metrics.sentiment.percentages.positive}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full bg-green-600"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
