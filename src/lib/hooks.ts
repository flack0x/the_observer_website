"use client";

import { useState, useEffect } from "react";

// Article type (matches what API returns from Supabase)
// Note: Use getRelativeTime(date, locale) from time.ts for display
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: Date;
  link: string;
  channel: "en" | "ar";
  category: string;
  countries: string[];
  organizations: string[];
  isStructured: boolean;
  isBreaking: boolean;
}

// Parse date strings from API response into Date objects
function parseArticleDates(articles: unknown[]): Article[] {
  return articles.map((article) => {
    const a = article as Record<string, unknown>;
    return {
      ...a,
      date: new Date(a.date as string),
    } as Article;
  });
}

// Hook to fetch articles on the client side
export function useArticles(channel: "en" | "ar" | "all" = "en") {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles?channel=${channel}`);

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await response.json();

        if (channel === "all") {
          // Combine and sort by most recent
          const combined = [
            ...parseArticleDates(data.en || []),
            ...parseArticleDates(data.ar || []),
          ];
          setArticles(combined);
        } else {
          setArticles(parseArticleDates(data));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [channel]);

  return { articles, loading, error };
}

// Hook for breaking news ticker
export function useBreakingNews(locale: "en" | "ar" = "en") {
  const { articles, loading } = useArticles(locale);

  const breakingNews = articles.slice(0, 5).map((article) => {
    const prefix = article.category.toUpperCase();
    const title = article.title.length > 80
      ? article.title.substring(0, 77) + "..."
      : article.title;
    return `${prefix}: ${title}`;
  });

  return { breakingNews, loading };
}
