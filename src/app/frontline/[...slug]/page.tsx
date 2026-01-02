"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Tag, ExternalLink, Share2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  timestamp: string;
  category: string;
  link: string;
}

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  // Reconstruct the article ID from slug
  const slug = params.slug as string[];
  const articleId = slug?.join("/") || "";

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch("/api/articles?channel=en");
        const articles = await res.json();

        // Find the article by ID
        const found = articles.find((a: Article) => a.id === articleId);
        setArticle(found || null);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    }

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-tactical-red border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-midnight-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="font-heading text-2xl font-bold text-slate-light mb-4">
            Article Not Found
          </h1>
          <p className="text-slate-medium mb-8">
            This article may have been removed or the link is incorrect.
          </p>
          <Link
            href="/frontline"
            className="inline-flex items-center gap-2 px-6 py-3 bg-tactical-red text-white rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-tactical-red-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Frontline
          </Link>
        </div>
      </div>
    );
  }

  // Format content into paragraphs
  const paragraphs = article.content
    .split("\n\n")
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim());

  return (
    <article className="min-h-screen bg-midnight-900 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/frontline"
            className="inline-flex items-center gap-2 text-slate-medium hover:text-tactical-red transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-heading uppercase tracking-wider">
              Back to Frontline
            </span>
          </Link>
        </motion.div>

        {/* Article header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 sm:mb-12"
        >
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-tactical-red/10 text-tactical-red font-heading text-xs font-medium uppercase">
              {article.category}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-dark">
              <Clock className="h-4 w-4" />
              {article.timestamp}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-light leading-tight mb-6">
            {article.title}
          </h1>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-midnight-700">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-slate-medium hover:text-tactical-red transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View on Telegram
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied!");
              }}
              className="flex items-center gap-2 text-sm text-slate-medium hover:text-tactical-red transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </motion.header>

        {/* Article content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          {paragraphs.map((paragraph, index) => {
            // Check if it's a section header (Roman numerals or short uppercase)
            const isHeader =
              /^[IVX]+\.\s/.test(paragraph) ||
              (paragraph.length < 100 && paragraph === paragraph.toUpperCase());

            // Skip footer content
            if (
              paragraph.includes("@observer") ||
              paragraph.startsWith("Link to") ||
              paragraph.startsWith("🔵")
            ) {
              return null;
            }

            if (isHeader) {
              return (
                <h2
                  key={index}
                  className="font-heading text-xl font-bold text-slate-light mt-8 mb-4 uppercase tracking-wider"
                >
                  {paragraph}
                </h2>
              );
            }

            return (
              <p
                key={index}
                className="text-slate-medium leading-relaxed mb-4 text-base sm:text-lg"
              >
                {paragraph}
              </p>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-midnight-700"
        >
          <div className="bg-midnight-800 rounded-xl p-6 sm:p-8 text-center">
            <h3 className="font-heading text-lg font-bold text-slate-light mb-2">
              Stay Informed
            </h3>
            <p className="text-slate-medium text-sm mb-4">
              Join our Telegram channel for real-time updates
            </p>
            <a
              href="https://t.me/observer_5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-tactical-red text-white rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-tactical-red-hover transition-colors"
            >
              Join The Observer
            </a>
          </div>
        </motion.div>
      </div>
    </article>
  );
}
