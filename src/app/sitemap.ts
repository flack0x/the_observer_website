import { MetadataRoute } from 'next';

const baseUrl = 'https://the-observer-website.vercel.app';

// Static pages
const staticPages = [
  '',
  '/frontline',
  '/analysis',
  '/situation-room',
  '/dossier',
  '/arsenal',
  '/library',
  '/chronicles',
];

async function getArticles() {
  try {
    const res = await fetch(`${baseUrl}/api/articles?channel=en`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles();

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'hourly' : 'daily',
    priority: path === '' ? 1 : 0.8,
  }));

  const articleEntries: MetadataRoute.Sitemap = Array.isArray(articles)
    ? articles.map((article: { id: string; date?: string }) => ({
        url: `${baseUrl}/frontline/${article.id}`,
        lastModified: article.date ? new Date(article.date) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    : [];

  return [...staticEntries, ...articleEntries];
}
