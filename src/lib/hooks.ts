"use client";

import { useState, useEffect } from "react";
import type { ParsedArticle } from "./telegram";

// Hook to fetch articles on the client side
export function useArticles(channel: "en" | "ar" | "all" = "en") {
  const [articles, setArticles] = useState<ParsedArticle[]>([]);
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
          const combined = [...(data.en || []), ...(data.ar || [])];
          setArticles(combined);
        } else {
          setArticles(data);
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
export function useBreakingNews() {
  const { articles, loading } = useArticles("en");

  const breakingNews = articles.slice(0, 5).map((article) => {
    const prefix = article.category.toUpperCase();
    const title = article.title.length > 80
      ? article.title.substring(0, 77) + "..."
      : article.title;
    return `${prefix}: ${title}`;
  });

  return { breakingNews, loading };
}
