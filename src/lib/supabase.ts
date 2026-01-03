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
  countries: string[];
  organizations: string[];
  is_structured: boolean;
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
// Note: `date` is a Date object - use getRelativeTime(date, locale) from time.ts for display
export function dbArticleToFrontend(article: DBArticle) {
  return {
    id: article.telegram_id,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    date: new Date(article.telegram_date),
    link: article.telegram_link,
    channel: article.channel,
    category: article.category,
    countries: article.countries || [],
    organizations: article.organizations || [],
    isStructured: article.is_structured || false,
    isBreaking: article.category === 'Breaking',
  };
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
