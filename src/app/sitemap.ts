import { MetadataRoute } from 'next';
import { fetchArticlesFromDB, fetchBookReviews } from '@/lib/supabase';

const baseUrl = 'https://al-muraqeb.com';
const locales = ['en', 'ar'] as const;

// Only pages that actually exist
const staticPaths = [
  '',
  '/frontline',
  '/situation-room',
  '/books',
  '/about',
  '/privacy',
  '/terms',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch articles and book reviews directly from Supabase (not self-referential API)
  const [enArticles, arArticles, enBooks, arBooks] = await Promise.all([
    fetchArticlesFromDB('en', 100),
    fetchArticlesFromDB('ar', 100),
    fetchBookReviews('en', 50),
    fetchBookReviews('ar', 50),
  ]);

  // Static pages for both locales
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: (path === '' ? 'hourly' : 'daily') as 'hourly' | 'daily',
      priority: path === '' ? 1 : 0.8,
    }))
  );

  // Article pages for English
  const enArticleEntries: MetadataRoute.Sitemap = enArticles.map((article) => ({
    url: `${baseUrl}/en/frontline/${article.slug}`,
    lastModified: new Date(article.telegram_date),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Article pages for Arabic
  const arArticleEntries: MetadataRoute.Sitemap = arArticles.map((article) => ({
    url: `${baseUrl}/ar/frontline/${article.slug}`,
    lastModified: new Date(article.telegram_date),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Book review pages for English
  const enBookEntries: MetadataRoute.Sitemap = enBooks.map((book) => ({
    url: `${baseUrl}/en/books/${book.review_id}`,
    lastModified: new Date(book.updated_at || book.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // Book review pages for Arabic
  const arBookEntries: MetadataRoute.Sitemap = arBooks.map((book) => ({
    url: `${baseUrl}/ar/books/${book.review_id}`,
    lastModified: new Date(book.updated_at || book.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...enArticleEntries, ...arArticleEntries, ...enBookEntries, ...arBookEntries];
}
