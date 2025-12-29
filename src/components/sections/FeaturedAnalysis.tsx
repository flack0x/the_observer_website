"use client";

import { motion } from "framer-motion";
import { Clock, User, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useArticles } from "@/lib/hooks";

// Fallback while loading
const fallbackArticles = [
  {
    id: "1",
    title: "The Axis of Resistance: Strategic Realignment in a Changing Region",
    excerpt:
      "An in-depth analysis of how resistance movements are reshaping the regional order, challenging Western hegemony, and building new frameworks for sovereignty and self-determination.",
    author: "Strategic Analysis Desk",
    readTime: "15 min read",
    category: "Geopolitics",
    featured: true,
  },
  {
    id: "2",
    title: "Economic Imperialism: Gas Deals and Structural Dependency",
    excerpt:
      "Examining how energy agreements like the Egypt-Israel gas deal create long-term economic dependencies that finance occupation while undermining regional sovereignty.",
    author: "Economic Intelligence Unit",
    readTime: "12 min read",
    category: "Economics",
    featured: false,
  },
  {
    id: "3",
    title: "Deterrence vs Diplomacy: Why Lebanon Succeeded Where Egypt Failed",
    excerpt:
      "Contrasting Lebanon's resistance-backed maritime gains with Egypt's capitulation, revealing how armed deterrence shapes negotiating outcomes.",
    author: "Military Analysis Team",
    readTime: "18 min read",
    category: "Strategy",
    featured: false,
  },
];

export default function FeaturedAnalysis() {
  const { articles, loading } = useArticles("en");

  // Use real articles or fallback - skip first 4 (used in LatestIntel) and take next 3
  const featuredArticles = loading || articles.length < 5
    ? fallbackArticles
    : articles.slice(4, 7).map((article) => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt || article.title,
        author: "The Observer",
        readTime: `${Math.ceil(article.content.split(" ").length / 200)} min read`,
        category: article.category,
        featured: false,
      }));
  return (
    <section className="border-t border-midnight-700 bg-midnight-900 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-tactical-amber/10">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-tactical-amber" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-light">
                Deep Dives
              </h2>
              <p className="text-xs sm:text-sm text-slate-dark">Long-form geopolitical analysis</p>
            </div>
          </div>
          <Link
            href="/analysis"
            className="group flex items-center gap-2 font-heading text-xs sm:text-sm font-medium uppercase tracking-wider text-tactical-amber transition-colors hover:text-tactical-red"
          >
            All Analysis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Featured Article */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group mb-8 overflow-hidden rounded-2xl border border-midnight-600 bg-gradient-to-br from-midnight-800 to-midnight-700"
        >
          <div className="grid lg:grid-cols-2">
            {/* Image Placeholder */}
            <div className="relative h-64 bg-midnight-700 lg:h-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-tactical-red/20 to-tactical-amber/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-tactical-red/30 bg-midnight-800">
                    <BookOpen className="h-10 w-10 text-tactical-red" />
                  </div>
                  <span className="font-heading text-sm uppercase tracking-wider text-slate-dark">
                    Featured Analysis
                  </span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="rounded-full bg-tactical-amber px-4 py-1 font-heading text-xs font-bold uppercase text-midnight-900">
                  Editor&apos;s Pick
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="rounded bg-tactical-amber/20 px-2 py-1 font-heading text-[10px] sm:text-xs font-medium uppercase text-tactical-amber">
                  {featuredArticles[0].category}
                </span>
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-dark">
                  <Clock className="h-3 w-3" />
                  {featuredArticles[0].readTime}
                </span>
              </div>

              <h3 className="mb-4 font-heading text-lg sm:text-2xl font-bold uppercase leading-tight text-slate-light transition-colors group-hover:text-tactical-amber lg:text-3xl">
                {featuredArticles[0].title}
              </h3>

              <p className="mb-6 font-body text-sm sm:text-base leading-relaxed text-slate-medium">
                {featuredArticles[0].excerpt}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-midnight-600 pt-4 sm:pt-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-midnight-600">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-slate-medium" />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-dark">{featuredArticles[0].author}</span>
                </div>
                <Link
                  href={`/analysis/${featuredArticles[0].id}`}
                  className="group/btn flex items-center justify-center gap-2 rounded-lg bg-tactical-amber px-4 py-2.5 sm:px-6 sm:py-3 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-midnight-900 transition-all hover:bg-tactical-amber-dark"
                >
                  Read Analysis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Secondary Articles */}
        <div className="grid gap-6 md:grid-cols-2">
          {featuredArticles.slice(1).map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-xl border border-midnight-600 bg-midnight-800 p-6 transition-all hover:border-midnight-500 card-hover"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded bg-midnight-600 px-2 py-1 font-heading text-xs font-medium uppercase text-slate-medium">
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-dark">
                  <Clock className="h-3 w-3" />
                  {article.readTime}
                </span>
              </div>

              <h4 className="mb-3 font-heading text-lg font-bold uppercase leading-snug text-slate-light transition-colors group-hover:text-tactical-amber">
                {article.title}
              </h4>

              <p className="mb-4 text-sm leading-relaxed text-slate-dark">
                {article.excerpt}
              </p>

              <div className="flex items-center justify-between border-t border-midnight-700 pt-4">
                <span className="flex items-center gap-2 text-xs text-slate-dark">
                  <User className="h-3 w-3" />
                  {article.author}
                </span>
                <Link
                  href={`/analysis/${article.id}`}
                  className="flex items-center gap-1 font-heading text-xs font-medium uppercase tracking-wider text-tactical-amber transition-colors hover:text-tactical-red"
                >
                  Read More
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
