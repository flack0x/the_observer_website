"use client";

import { motion } from "framer-motion";
import { BookOpen, Star, ArrowRight, Filter, Search, User } from "lucide-react";
import Link from "next/link";

const books = [
  {
    id: 1,
    title: "The Art of Strategic Patience",
    author: "Anonymous Strategist",
    category: "Strategy",
    rating: 5,
    excerpt:
      "A masterful examination of long-term strategic thinking and the power of calculated restraint in geopolitical maneuvering.",
    tags: ["Strategy", "Geopolitics", "Philosophy"],
    featured: true,
  },
  {
    id: 2,
    title: "Resistance Economics",
    author: "Dr. Economic Analyst",
    category: "Economics",
    rating: 4,
    excerpt:
      "Comprehensive analysis of economic survival strategies under sanctions and financial isolation.",
    tags: ["Economics", "Sanctions", "Development"],
    featured: false,
  },
  {
    id: 3,
    title: "Ideology and Power",
    author: "Political Scholar",
    category: "Ideology",
    rating: 5,
    excerpt:
      "Deep dive into the ideological foundations that drive resistance movements and their evolution over time.",
    tags: ["Ideology", "History", "Politics"],
    featured: false,
  },
  {
    id: 4,
    title: "The Geography of Conflict",
    author: "Military Historian",
    category: "History",
    rating: 4,
    excerpt:
      "Understanding how terrain and geography shape military strategy and political outcomes in the region.",
    tags: ["Military", "Geography", "History"],
    featured: false,
  },
  {
    id: 5,
    title: "Digital Battlefields",
    author: "Cyber Analyst",
    category: "Technology",
    rating: 4,
    excerpt:
      "The emerging domain of cyber warfare and its implications for modern conflict.",
    tags: ["Cyber", "Technology", "Warfare"],
    featured: false,
  },
  {
    id: 6,
    title: "Narrative Warfare",
    author: "Media Researcher",
    category: "Information",
    rating: 5,
    excerpt:
      "How information and narrative shape perception and influence the trajectory of conflicts.",
    tags: ["Media", "Propaganda", "Information"],
    featured: false,
  },
];

const categories = ["All", "Strategy", "Economics", "Ideology", "History", "Technology"];

export default function LibraryPage() {
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
                  The Library
                </h1>
                <p className="text-slate-dark">Curated book reviews and strategic reading</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-midnight-700 bg-midnight-800/50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-midnight-600 bg-midnight-700 px-4 py-2">
              <Search className="h-4 w-4 text-slate-dark" />
              <input
                type="text"
                placeholder="Search books..."
                className="w-48 bg-transparent text-sm text-slate-light placeholder-slate-dark outline-none"
              />
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

      {/* Books Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Featured Book */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="group mb-12 overflow-hidden rounded-2xl border border-midnight-600 bg-gradient-to-br from-midnight-800 to-midnight-700"
          >
            <div className="grid lg:grid-cols-3">
              <div className="relative flex items-center justify-center bg-midnight-700 p-12 lg:p-16">
                <div className="relative">
                  <div className="h-64 w-44 rounded-lg bg-gradient-to-br from-tactical-red to-tactical-amber shadow-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white/30" />
                  </div>
                </div>
                <div className="absolute left-4 top-4">
                  <span className="rounded-full bg-tactical-amber px-4 py-1 font-heading text-xs font-bold uppercase text-midnight-900">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-8 lg:col-span-2 lg:p-10">
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded bg-tactical-amber/20 px-2 py-1 font-heading text-xs font-medium uppercase text-tactical-amber">
                    {books[0].category}
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: books[0].rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-tactical-amber text-tactical-amber" />
                    ))}
                  </div>
                </div>
                <h2 className="mb-2 font-heading text-2xl font-bold uppercase tracking-wider text-slate-light lg:text-3xl">
                  {books[0].title}
                </h2>
                <p className="mb-4 flex items-center gap-2 text-sm text-slate-dark">
                  <User className="h-4 w-4" />
                  {books[0].author}
                </p>
                <p className="mb-6 font-body text-base leading-relaxed text-slate-medium">
                  {books[0].excerpt}
                </p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {books[0].tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-midnight-500 px-3 py-1 text-xs text-slate-dark"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/library/${books[0].id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-tactical-amber px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-midnight-900 transition-all hover:bg-tactical-amber-dark"
                >
                  Read Full Review
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.article>

          {/* Books Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.slice(1).map((book, index) => (
              <motion.article
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group overflow-hidden rounded-xl border border-midnight-600 bg-midnight-800 transition-all hover:border-tactical-amber"
              >
                {/* Book Cover */}
                <div className="relative flex h-48 items-center justify-center bg-midnight-700">
                  <div className="h-32 w-24 rounded bg-gradient-to-br from-midnight-500 to-midnight-600 shadow-lg" />
                  <BookOpen className="absolute h-8 w-8 text-slate-dark" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded bg-midnight-600 px-2 py-0.5 font-heading text-[10px] font-medium uppercase text-slate-medium">
                      {book.category}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: book.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-tactical-amber text-tactical-amber" />
                      ))}
                    </div>
                  </div>
                  <h3 className="mb-1 font-heading text-lg font-bold uppercase tracking-wider text-slate-light transition-colors group-hover:text-tactical-amber">
                    {book.title}
                  </h3>
                  <p className="mb-3 text-xs text-slate-dark">{book.author}</p>
                  <p className="mb-4 text-sm leading-relaxed text-slate-dark line-clamp-3">
                    {book.excerpt}
                  </p>
                  <Link
                    href={`/library/${book.id}`}
                    className="flex items-center gap-1 font-heading text-xs font-medium uppercase tracking-wider text-tactical-amber transition-colors hover:text-tactical-red"
                  >
                    Read Review
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
