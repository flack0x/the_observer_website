"use client";

import { motion } from "framer-motion";
import { Clock, ArrowRight, AlertTriangle, MapPin, Tag, Loader2 } from "lucide-react";
import Link from "next/link";
import { useArticles } from "@/lib/hooks";

// Fallback data while loading
const fallbackNews = [
  {
    id: "1",
    category: "Breaking",
    title: "Egypt-Israel Gas Deal: $35 Billion in Economic Dependency",
    excerpt:
      "Analysis of the 15-year natural gas agreement that creates Egyptian economic dependency while financing Israeli military operations. A stark contrast to Lebanon's deterrence-backed gains.",
    timestamp: "2 hours ago",
    location: "Egypt-Israel",
    isBreaking: true,
  },
  {
    id: "2",
    category: "Analysis",
    title: "Trump's Golan Heights Decision: Sovereignty vs International Law",
    excerpt:
      "Examining the December 2025 decision granting Israel 'sovereignty rights' over occupied Syrian territory. Trump admits the region is 'worth trillions of dollars.'",
    timestamp: "5 hours ago",
    location: "Golan Heights",
    isBreaking: false,
  },
  {
    id: "3",
    category: "Intelligence",
    title: "AI-Enabled Genocide: The Algorithms Behind Gaza Operations",
    excerpt:
      "Exposing Israeli AI systems 'Lavender,' 'The Gospel,' and 'Where's Daddy?' - the world's first AI-managed military targeting with corporate backing from Palantir, Google, and Microsoft.",
    timestamp: "8 hours ago",
    location: "Gaza",
    isBreaking: false,
  },
  {
    id: "4",
    category: "Military",
    title: "Iraq PMF Weapons Monopoly: Strategic Neutralization?",
    excerpt:
      "Questions emerge over the timing of weapons control demands on resistance factions. Analysis warns: disarmament before state strengthening equals neutralization.",
    timestamp: "12 hours ago",
    location: "Iraq",
    isBreaking: false,
  },
];

export default function LatestIntel() {
  const { articles, loading } = useArticles("en");

  // Use real articles or fallback
  const latestNews = loading || articles.length === 0
    ? fallbackNews
    : articles.slice(0, 4).map((article, index) => ({
        id: article.id,
        category: article.category,
        title: article.title,
        excerpt: article.excerpt,
        timestamp: article.timestamp,
        location: "Region",
        isBreaking: index === 0,
      }));
  return (
    <section className="border-t border-midnight-700 bg-midnight-800 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tactical-red/10">
              <AlertTriangle className="h-5 w-5 text-tactical-red" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
                The Frontline
              </h2>
              <p className="text-sm text-slate-dark">Latest intelligence reports</p>
            </div>
          </div>
          <Link
            href="/frontline"
            className="group flex items-center gap-2 font-heading text-sm font-medium uppercase tracking-wider text-tactical-red transition-colors hover:text-tactical-amber"
          >
            View All Reports
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* News Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Featured Article */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-xl border border-midnight-600 bg-midnight-700 p-6 transition-all hover:border-tactical-red card-hover"
          >
            {latestNews[0].isBreaking && (
              <div className="absolute right-4 top-4">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center gap-1 rounded-full bg-tactical-red px-3 py-1 text-xs font-bold uppercase text-white"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  Breaking
                </motion.div>
              </div>
            )}

            <div className="mb-4 flex items-center gap-3">
              <span className="rounded bg-tactical-red/20 px-2 py-1 font-heading text-xs font-medium uppercase text-tactical-red">
                {latestNews[0].category}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-dark">
                <Clock className="h-3 w-3" />
                {latestNews[0].timestamp}
              </span>
            </div>

            <h3 className="mb-3 font-heading text-xl font-bold uppercase leading-tight text-slate-light transition-colors group-hover:text-tactical-red">
              {latestNews[0].title}
            </h3>

            <p className="mb-4 font-body text-sm leading-relaxed text-slate-medium">
              {latestNews[0].excerpt}
            </p>

            <div className="flex items-center gap-4 border-t border-midnight-600 pt-4">
              <span className="flex items-center gap-1 text-xs text-slate-dark">
                <MapPin className="h-3 w-3" />
                {latestNews[0].location}
              </span>
              <Link
                href={`/frontline/${latestNews[0].id}`}
                className="ml-auto flex items-center gap-1 font-heading text-xs font-medium uppercase tracking-wider text-tactical-red transition-colors hover:text-tactical-amber"
              >
                Read Full Report
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.article>

          {/* Secondary Articles */}
          <div className="space-y-4">
            {latestNews.slice(1).map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex gap-4 rounded-lg border border-midnight-600 bg-midnight-700/50 p-4 transition-all hover:border-midnight-500 hover:bg-midnight-700"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="rounded bg-midnight-600 px-2 py-0.5 font-heading text-[10px] font-medium uppercase text-slate-medium">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-dark">
                      <Clock className="h-2.5 w-2.5" />
                      {article.timestamp}
                    </span>
                  </div>
                  <h4 className="font-heading text-sm font-bold uppercase leading-snug text-slate-light transition-colors group-hover:text-tactical-red">
                    {article.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-dark line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
                <Link
                  href={`/frontline/${article.id}`}
                  className="flex shrink-0 items-center justify-center rounded-lg border border-midnight-500 p-2 transition-all hover:border-tactical-red hover:bg-tactical-red/10"
                >
                  <ArrowRight className="h-4 w-4 text-slate-medium" />
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
