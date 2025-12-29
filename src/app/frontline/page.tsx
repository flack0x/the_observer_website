"use client";

import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  ArrowRight,
  AlertTriangle,
  Filter,
  Search,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useArticles } from "@/lib/hooks";

// Fallback data while loading
const fallbackArticles = [
  {
    id: "1",
    category: "Breaking",
    title: "Egypt Signs $35 Billion Gas Deal with Israel",
    excerpt:
      "A 15-year natural gas agreement valued at $34-35 billion creates Egyptian economic dependency while financing Israeli military operations.",
    timestamp: "2 hours ago",
    location: "Region",
    isBreaking: true,
    readTime: "8 min",
  },
  {
    id: "2",
    category: "Analysis",
    title: "Trump Grants Israel 'Sovereignty' Over Occupied Golan",
    excerpt:
      "December 2025 decision violates international law as Trump admits the region is 'worth trillions of dollars.'",
    timestamp: "5 hours ago",
    location: "Region",
    isBreaking: false,
    readTime: "10 min",
  },
  {
    id: "3",
    category: "Intelligence",
    title: "Gaza AI Systems Exposed: Lavender, Gospel, Where's Daddy?",
    excerpt:
      "Israeli AI targeting systems revealed with corporate backing from Palantir, Google, Amazon, and Microsoft.",
    timestamp: "8 hours ago",
    location: "Region",
    isBreaking: false,
    readTime: "12 min",
  },
  {
    id: "4",
    category: "Military",
    title: "Iraq PMF Faces Weapons Monopoly Demands",
    excerpt:
      "Questions emerge over timing of weapons control demands on Popular Mobilization Forces.",
    timestamp: "12 hours ago",
    location: "Region",
    isBreaking: false,
    readTime: "7 min",
  },
];

const categories = ["All", "Breaking", "Military", "Intelligence", "Economic", "Diplomatic", "Analysis"];

export default function FrontlinePage() {
  const { articles, loading } = useArticles("en");

  // Transform real articles or use fallback
  const newsArticles = loading || articles.length === 0
    ? fallbackArticles
    : articles.map((article, index) => ({
        id: article.id,
        category: article.category,
        title: article.title,
        excerpt: article.excerpt,
        timestamp: article.timestamp,
        location: "Region",
        isBreaking: index === 0,
        readTime: `${Math.ceil(article.content.split(" ").length / 200)} min`,
      }));
  return (
    <div className="min-h-screen bg-midnight-900">
      {/* Hero */}
      <section className="border-b border-midnight-700 bg-midnight-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-tactical-red/10">
              <AlertTriangle className="h-6 w-6 text-tactical-red" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-slate-light">
                The Frontline
              </h1>
              <p className="text-slate-dark">Real-time intelligence reports and breaking developments</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-midnight-700 bg-midnight-800/50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-dark" />
              <span className="text-sm text-slate-dark">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`rounded-full px-4 py-1.5 font-heading text-xs font-medium uppercase tracking-wider transition-all ${
                    category === "All"
                      ? "bg-tactical-red text-white"
                      : "border border-midnight-600 text-slate-medium hover:border-tactical-red hover:text-tactical-red"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2 rounded-lg border border-midnight-600 bg-midnight-700 px-3 py-2">
              <Search className="h-4 w-4 text-slate-dark" />
              <input
                type="text"
                placeholder="Search reports..."
                className="bg-transparent text-sm text-slate-light placeholder-slate-dark outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {newsArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-xl border border-midnight-600 bg-midnight-800 p-6 transition-all hover:border-tactical-red card-hover"
              >
                {article.isBreaking && (
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="mb-4 inline-flex items-center gap-1 rounded-full bg-tactical-red px-3 py-1 text-xs font-bold uppercase text-white"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    Breaking
                  </motion.div>
                )}

                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded bg-midnight-600 px-2 py-1 font-heading text-xs font-medium uppercase text-slate-medium">
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-dark">
                    <Clock className="h-3 w-3" />
                    {article.timestamp}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-dark">
                    <MapPin className="h-3 w-3" />
                    {article.location}
                  </span>
                </div>

                <h2 className="mb-3 font-heading text-xl font-bold uppercase leading-tight text-slate-light transition-colors group-hover:text-tactical-red">
                  {article.title}
                </h2>

                <p className="mb-4 font-body text-sm leading-relaxed text-slate-medium">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between border-t border-midnight-700 pt-4">
                  <span className="text-xs text-slate-dark">{article.readTime} read</span>
                  <Link
                    href={`/frontline/${article.id}`}
                    className="flex items-center gap-1 font-heading text-xs font-medium uppercase tracking-wider text-tactical-red transition-colors hover:text-tactical-amber"
                  >
                    Full Report
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 flex justify-center">
            <button className="flex items-center gap-2 rounded-lg border border-midnight-600 bg-midnight-800 px-8 py-3 font-heading text-sm font-medium uppercase tracking-wider text-slate-light transition-all hover:border-tactical-red hover:text-tactical-red">
              Load More Reports
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
