"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Globe,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  PieChart,
  Clock,
  AlertTriangle,
  Target,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

interface Metrics {
  computed_at: string;
  total_articles: number;
  countries: Record<string, number>;
  organizations: Record<string, number>;
  categories: Record<string, number>;
  temporal: {
    articles_today: number;
    articles_this_week: number;
    articles_this_month: number;
    daily_trend: { date: string; count: number }[];
    peak_hour: number;
  };
  channels: {
    counts: Record<string, number>;
    percentages: Record<string, number>;
  };
  sentiment: {
    distribution: Record<string, number>;
    percentages: Record<string, number>;
  };
  conflict_analysis: {
    by_category: Record<string, number>;
    top_keywords: Record<string, Record<string, number>>;
  };
  trending: { topic: string; mentions: number }[];
}

const COLORS = {
  red: "#B91C1C",
  amber: "#D4AF37",
  blue: "#1B3A57",
  green: "#6B7B4C",
  purple: "#7C3AED",
  orange: "#F97316",
};

const CHART_COLORS = ["#B91C1C", "#D4AF37", "#1B3A57", "#6B7B4C", "#7C3AED", "#F97316", "#14B8A6", "#EC4899"];

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color = "red",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color?: keyof typeof COLORS;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-midnight-600 bg-midnight-800 p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-dark">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-light">{value}</p>
          {subValue && <p className="mt-1 text-xs text-slate-dark">{subValue}</p>}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${COLORS[color]}20` }}
        >
          <Icon className="h-5 w-5" style={{ color: COLORS[color] }} />
        </div>
      </div>
    </motion.div>
  );
}

export default function SituationRoomPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/metrics");
        if (!res.ok) throw new Error("Failed to fetch metrics");
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-tactical-red mx-auto mb-4" />
          <p className="text-slate-medium">Loading intelligence data...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-tactical-amber mx-auto mb-4" />
          <p className="text-slate-medium">Unable to load analytics. Please try again.</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const countryData = Object.entries(metrics.countries)
    .slice(0, 8)
    .map(([name, value]) => ({ name: formatLabel(name), value }));

  const orgData = Object.entries(metrics.organizations)
    .slice(0, 8)
    .map(([name, value]) => ({ name: formatLabel(name), value }));

  const categoryData = Object.entries(metrics.categories).map(([name, value]) => ({
    name,
    value,
  }));

  const sentimentData = Object.entries(metrics.sentiment.distribution).map(([name, value]) => ({
    name: formatLabel(name),
    value,
  }));

  const trendData = metrics.temporal.daily_trend.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    articles: d.count,
  }));

  const conflictData = Object.entries(metrics.conflict_analysis.by_category).map(([name, value]) => ({
    name: formatLabel(name),
    value,
  }));

  const computedAt = new Date(metrics.computed_at).toLocaleString();

  return (
    <div className="min-h-screen bg-midnight-900">
      {/* Header */}
      <section className="border-b border-midnight-700 bg-midnight-800 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-tactical-red/10">
                <Activity className="h-6 w-6 text-tactical-red" />
                <motion.div
                  className="absolute inset-0 rounded-lg border border-tactical-red/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-slate-light">
                  Intelligence Dashboard
                </h1>
                <p className="text-slate-dark">Real-time analytics from {metrics.total_articles} articles</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-dark">
              <Clock className="h-4 w-4" />
              <span>Updated: {computedAt}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={BarChart3}
            label="Total Articles"
            value={metrics.total_articles.toLocaleString()}
            subValue="In database"
            color="red"
          />
          <StatCard
            icon={Zap}
            label="This Week"
            value={metrics.temporal.articles_this_week}
            subValue={`${metrics.temporal.articles_today} today`}
            color="amber"
          />
          <StatCard
            icon={Globe}
            label="Countries Tracked"
            value={Object.keys(metrics.countries).length}
            subValue="Mentioned in articles"
            color="blue"
          />
          <StatCard
            icon={Target}
            label="Organizations"
            value={Object.keys(metrics.organizations).length}
            subValue="Active entities"
            color="green"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Activity Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-midnight-600 bg-midnight-800 p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-tactical-amber" />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                Article Activity (14 Days)
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#B91C1C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#5f6368" fontSize={10} tickLine={false} />
                  <YAxis stroke="#5f6368" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="articles"
                    stroke="#B91C1C"
                    strokeWidth={2}
                    fill="url(#colorArticles)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Country Mentions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-midnight-600 bg-midnight-800 p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Globe className="h-5 w-5 text-tactical-red" />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                Top Country Mentions
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData} layout="vertical">
                  <XAxis type="number" stroke="#5f6368" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#5f6368" fontSize={10} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#B91C1C" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-midnight-600 bg-midnight-800 p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5 text-tactical-amber" />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                Categories
              </h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryData.slice(0, 6).map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-slate-medium truncate">{cat.name}</span>
                  <span className="text-slate-dark ml-auto">{cat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sentiment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-midnight-600 bg-midnight-800 p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-tactical-red" />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                Sentiment Analysis
              </h3>
            </div>
            <div className="space-y-4">
              {sentimentData.map((item) => {
                const percentage = metrics.sentiment.percentages[item.name.toLowerCase()] || 0;
                const color =
                  item.name === "Negative" ? "#B91C1C" : item.name === "Positive" ? "#6B7B4C" : "#D4AF37";
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-medium">{item.name}</span>
                      <span className="text-slate-light font-medium">{percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-midnight-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-midnight-700">
              <p className="text-xs text-slate-dark text-center">
                Based on keyword analysis of {metrics.total_articles} articles
              </p>
            </div>
          </motion.div>

          {/* Organizations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-midnight-600 bg-midnight-800 p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-tactical-amber" />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                Top Organizations
              </h3>
            </div>
            <div className="space-y-3">
              {orgData.slice(0, 7).map((org, i) => (
                <div key={org.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-dark w-4">{i + 1}</span>
                    <span className="text-sm text-slate-light">{org.name}</span>
                  </div>
                  <span className="text-sm font-mono text-tactical-amber">{org.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Conflict Analysis & Trending */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Conflict Keywords */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-midnight-600 bg-midnight-800 p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-5 w-5 text-tactical-red" />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                Conflict Analysis
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conflictData}>
                  <XAxis dataKey="name" stroke="#5f6368" fontSize={9} tickLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#5f6368" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Trending Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-xl border border-midnight-600 bg-midnight-800 p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-tactical-amber" />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                Trending This Week
              </h3>
            </div>
            <div className="space-y-3">
              {metrics.trending.slice(0, 10).map((topic, i) => {
                const maxMentions = metrics.trending[0]?.mentions || 1;
                const width = (topic.mentions / maxMentions) * 100;
                return (
                  <div key={topic.topic} className="relative">
                    <div className="flex items-center justify-between relative z-10 py-2 px-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-dark w-5">#{i + 1}</span>
                        <span className="text-sm text-slate-light font-medium">{formatLabel(topic.topic)}</span>
                      </div>
                      <span className="text-xs font-mono text-tactical-amber">{topic.mentions} mentions</span>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * i }}
                      className="absolute inset-y-0 left-0 rounded bg-tactical-red/10"
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-slate-dark">
            Analytics computed from {metrics.total_articles} articles across EN and AR channels.
            Data refreshed hourly via automated pipeline.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
