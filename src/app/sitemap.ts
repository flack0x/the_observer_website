import { MetadataRoute } from 'next';
import { fetchArticlesFromDB } from '@/lib/supabase';

const baseUrl = 'https://the-observer-website.vercel.app';
const locales = ['en', 'ar'] as const;

// Only pages that actually exist
const staticPaths = [
  '',
  '/frontline',
  '/situation-room',
  '/privacy',
  '/terms',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch articles directly from Supabase (not self-referential API)
  const [enArticles, arArticles] = await Promise.all([
    fetchArticlesFromDB('en', 100),
    fetchArticlesFromDB('ar', 100),
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
    url: `${baseUrl}/en/frontline/${article.telegram_id}`,
    lastModified: new Date(article.telegram_date),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Article pages for Arabic
  const arArticleEntries: MetadataRoute.Sitemap = arArticles.map((article) => ({
    url: `${baseUrl}/ar/frontline/${article.telegram_id}`,
    lastModified: new Date(article.telegram_date),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...enArticleEntries, ...arArticleEntries];
}
