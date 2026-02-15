"use client";

import { useState, useEffect } from "react";

// Article type (matches what API returns from Supabase)
// Note: Use getRelativeTime(date, locale) from time.ts for display
export interface Article {
  id: string;
  slug: string;
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
  imageUrl: string | null;
  videoUrl: string | null;
  views: number;
  likes: number;
  dislikes: number;
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

// Fetch with retry for resilience against transient failures
async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (i === retries) return response;
    } catch (err) {
      if (i === retries) throw err;
    }
    // Wait before retry (200ms, 500ms)
    await new Promise(r => setTimeout(r, (i + 1) * 200));
  }
  throw new Error("Failed after retries");
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
        // Add timestamp to prevent caching
        const response = await fetchWithRetry(
          `/api/articles?channel=${channel}&t=${Date.now()}`,
          {
            cache: 'no-store',
            headers: {
              'Pragma': 'no-cache',
              'Cache-Control': 'no-cache'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch articles (${response.status})`);
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
          // Ensure data is an array before parsing
          if (Array.isArray(data)) {
            setArticles(parseArticleDates(data));
          } else {
            console.error("Unexpected articles response format:", typeof data);
            setArticles([]);
          }
        }
      } catch (err) {
        console.error("Articles fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [channel]);

  return { articles, loading, error };
}

// Metrics type for dashboard/hero stats
export interface Metrics {
  computed_at: string;
  total_articles: number;
  countries: Record<string, number>;
  organizations: Record<string, number>;
  categories: Record<string, number>;
  temporal: {
    articles_today: number;
    articles_this_week: number;
    daily_trend: { date: string; count: number }[];
  };
  sentiment: {
    percentages: Record<string, number>;
  };
  trending: { topic: string; mentions: number }[];
}

// Hook to fetch metrics for stats display
export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const response = await fetchWithRetry("/api/metrics", {});

        if (!response.ok) {
          throw new Error(`Failed to fetch metrics (${response.status})`);
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error("Metrics fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
}

// ============================================
// Book Reviews
// ============================================

// Book Review type (matches what API returns)
export interface BookReview {
  id: string;
  bookTitle: string;
  author: string;
  coverImageUrl: string | null;
  excerpt: string | null;
  description: string;
  keyPoints: string[];
  rating: number | null;
  recommendationLevel: 'essential' | 'recommended' | 'optional' | null;
  telegramLink: string | null;
  channel: 'en' | 'ar';
  createdAt: Date;
}

// Parse date strings from API response into Date objects
function parseBookReviewDates(reviews: unknown[]): BookReview[] {
  return reviews.map((review) => {
    const r = review as Record<string, unknown>;
    return {
      ...r,
      createdAt: new Date(r.createdAt as string),
    } as BookReview;
  });
}

// Hook to fetch book reviews on the client side
export function useBookReviews(channel: 'en' | 'ar' = 'en') {
  const [bookReviews, setBookReviews] = useState<BookReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookReviews() {
      try {
        setLoading(true);
        const response = await fetch(`/api/books?channel=${channel}`);

        if (!response.ok) {
          throw new Error('Failed to fetch book reviews');
        }

        const data = await response.json();
        setBookReviews(parseBookReviewDates(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchBookReviews();
  }, [channel]);

  return { bookReviews, loading, error };
}
