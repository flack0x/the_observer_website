import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database
export interface DBArticle {
  id: number;
  telegram_id: string;
  channel: 'en' | 'ar';
  title: string;
  excerpt: string;
  content: string;
  category: string;
  telegram_link: string;
  telegram_date: string;
  created_at: string;
  updated_at: string;
}

// Fetch articles from Supabase
export async function fetchArticlesFromDB(
  channel: 'en' | 'ar' = 'en',
  limit: number = 20
): Promise<DBArticle[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('channel', channel)
    .order('telegram_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching articles from Supabase:', error);
    return [];
  }

  return data || [];
}

// Convert DB article to the format used by the frontend
export function dbArticleToFrontend(article: DBArticle) {
  return {
    id: article.telegram_id,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    timestamp: getRelativeTime(new Date(article.telegram_date)),
    date: new Date(article.telegram_date),
    link: article.telegram_link,
    channel: article.channel,
    category: article.category,
    isBreaking: false,
  };
}

// Generate relative timestamps for display
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Fetch a single article by telegram_id (for article detail pages)
export async function fetchArticleById(telegramId: string): Promise<DBArticle | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data;
}
