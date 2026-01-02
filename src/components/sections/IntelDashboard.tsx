"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, FileText, Globe, Activity } from "lucide-react";
import { useArticles } from "@/lib/hooks";

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  color = "tactical-red",
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  color?: string;
  delay?: number;
}) {
  const count = useCounter(value, 1500);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-midnight-800 rounded-xl p-5 sm:p-6 border border-midnight-700"
    >
      <div className={`inline-flex p-2.5 rounded-lg bg-${color}/10 mb-4`}>
        <Icon className={`h-5 w-5 text-${color}`} />
      </div>
      <div className="font-heading text-3xl sm:text-4xl font-bold text-slate-light mb-1">
        {count}{suffix}
      </div>
      <div className="text-sm text-slate-dark">{label}</div>
    </motion.div>
  );
}

// Category bar component
function CategoryBar({
  category,
  count,
  total,
  color,
  delay = 0,
}: {
  category: string;
  count: number;
  total: number;
  color: string;
  delay?: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-light font-medium">{category}</span>
        <span className="text-slate-dark">{count}</span>
      </div>
      <div className="h-2 bg-midnight-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.3, duration: 0.8 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </motion.div>
  );
}

export default function IntelDashboard() {
  const { articles } = useArticles("en");

  // Calculate stats from articles
  const totalArticles = articles.length || 127; // Fallback for display
  const categoryCounts = articles.reduce((acc, article) => {
    const cat = article.category || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Default category data if no articles
  const categoryData = Object.keys(categoryCounts).length > 0
    ? Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [
        ["Military", 45],
        ["Political", 38],
        ["Economic", 24],
        ["Intelligence", 15],
        ["Analysis", 5],
      ];

  const categoryColors = [
    "bg-tactical-red",
    "bg-tactical-amber",
    "bg-earth-olive",
    "bg-blue-500",
    "bg-purple-500",
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-midnight-800 border-y border-midnight-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-midnight-900 border border-midnight-600 mb-4">
            <Activity className="h-4 w-4 text-tactical-red" />
            <span className="text-xs font-heading font-medium uppercase tracking-wider text-slate-medium">
              Intelligence Overview
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-light">
            Network Activity
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
          <StatCard
            icon={FileText}
            label="Total Reports"
            value={totalArticles}
            suffix="+"
            color="tactical-red"
            delay={0}
          />
          <StatCard
            icon={Globe}
            label="Regions Covered"
            value={12}
            color="tactical-amber"
            delay={0.1}
          />
          <StatCard
            icon={TrendingUp}
            label="This Week"
            value={34}
            color="earth-olive"
            delay={0.2}
          />
          <StatCard
            icon={Activity}
            label="Live Sources"
            value={8}
            color="blue-500"
            delay={0.3}
          />
        </div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-midnight-900 rounded-xl p-6 sm:p-8 border border-midnight-700"
        >
          <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light mb-6">
            Coverage by Category
          </h3>
          <div className="space-y-4">
            {categoryData.map(([category, count], index) => (
              <CategoryBar
                key={category}
                category={String(category)}
                count={Number(count)}
                total={totalArticles}
                color={categoryColors[index] || "bg-slate-500"}
                delay={index * 0.1}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
