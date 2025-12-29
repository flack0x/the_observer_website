"use client";

import { motion } from "framer-motion";
import { Clock, User, ArrowRight, BookOpen, Filter } from "lucide-react";
import Link from "next/link";
import { useArticles } from "@/lib/hooks";

// Fallback articles while loading
const fallbackArticles = [
  {
    id: "1",
    title: "The Shifting Balance: A New Era of Multipolarity",
    excerpt:
      "An in-depth analysis of how recent geopolitical developments are reshaping the global order and challenging traditional power structures.",
    author: "The Observer",
    readTime: "15 min read",
    category: "Analysis",
    date: "Recent",
    featured: true,
  },
  {
    id: "2",
    title: "Economic Warfare: The New Battlefield",
    excerpt:
      "Examining the rise of economic instruments as tools of statecraft and their effectiveness in modern conflict scenarios.",
    author: "The Observer",
    readTime: "12 min read",
    category: "Economic",
    date: "Recent",
    featured: false,
  },
  {
    id: "3",
    title: "Doctrine of Deterrence: Evolution and Application",
    excerpt:
      "How deterrence strategies have evolved in response to asymmetric threats and technological advancement.",
    author: "The Observer",
    readTime: "18 min read",
    category: "Military",
    date: "Recent",
    featured: false,
  },
  {
    id: "4",
    title: "The Information Domain: Narratives as Weapons",
    excerpt:
      "Understanding the role of information warfare in shaping public perception and influencing policy decisions.",
    author: "The Observer",
    readTime: "14 min read",
    category: "Intelligence",
    date: "Recent",
    featured: false,
  },
];

const categories = ["All", "Analysis", "Military", "Economic", "Intelligence", "Diplomatic", "Breaking"];

export default function AnalysisPage() {
  const { articles: telegramArticles, loading } = useArticles("en");

  // Transform real articles or use fallback
  const articles = loading || telegramArticles.length === 0
    ? fallbackArticles
    : telegramArticles.map((article, index) => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        author: "The Observer",
        readTime: `${Math.ceil(article.content.split(" ").length / 200)} min read`,
        category: article.category,
        date: article.timestamp,
        featured: index === 0,
      }));
  return (
    <div className="min-h-screen bg-midnight-900">
      {/* Hero */}
      <section className="border-b border-midnight-700 bg-midnight-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-tactical-amber/10">
                <BookOpen className="h-6 w-6 text-tactical-amber" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-slate-light">
                  Deep Dives
                </h1>
                <p className="text-slate-dark">Long-form geopolitical analysis and strategic assessments</p>
              </div>
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
              <span className="text-sm text-slate-dark">Category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`rounded-full px-4 py-1.5 font-heading text-xs font-medium uppercase tracking-wider transition-all ${
                    category === "All"
                      ? "bg-tactical-amber text-midnight-900"
                      : "border border-midnight-600 text-slate-medium hover:border-tactical-amber hover:text-tactical-amber"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Featured Article */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="group mb-12 overflow-hidden rounded-2xl border border-midnight-600 bg-gradient-to-br from-midnight-800 to-midnight-700"
          >
            <div className="grid lg:grid-cols-2">
              <div className="relative h-64 bg-midnight-700 lg:h-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-tactical-amber/20 to-tactical-red/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-tactical-amber/30" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="rounded-full bg-tactical-amber px-4 py-1 font-heading text-xs font-bold uppercase text-midnight-900">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-8 lg:p-10">
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded bg-tactical-amber/20 px-2 py-1 font-heading text-xs font-medium uppercase text-tactical-amber">
                    {articles[0].category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-dark">
                    <Clock className="h-3 w-3" />
                    {articles[0].readTime}
                  </span>
                </div>
                <h2 className="mb-4 font-heading text-2xl font-bold uppercase leading-tight text-slate-light transition-colors group-hover:text-tactical-amber lg:text-3xl">
                  {articles[0].title}
                </h2>
                <p className="mb-6 font-body text-base leading-relaxed text-slate-medium">
                  {articles[0].excerpt}
                </p>
                <div className="flex items-center justify-between border-t border-midnight-600 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-midnight-600">
                      <User className="h-5 w-5 text-slate-medium" />
                    </div>
                    <div>
                      <span className="block text-sm text-slate-light">{articles[0].author}</span>
                      <span className="text-xs text-slate-dark">{articles[0].date}</span>
                    </div>
                  </div>
                  <Link
                    href={`/analysis/${articles[0].id}`}
                    className="group/btn flex items-center gap-2 rounded-lg bg-tactical-amber px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-midnight-900 transition-all hover:bg-tactical-amber-dark"
                  >
                    Read Analysis
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Article Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {articles.slice(1).map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
                <h3 className="mb-3 font-heading text-lg font-bold uppercase leading-snug text-slate-light transition-colors group-hover:text-tactical-amber">
                  {article.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-dark">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between border-t border-midnight-700 pt-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-dark" />
                    <span className="text-xs text-slate-dark">{article.author}</span>
                  </div>
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
    </div>
  );
}
