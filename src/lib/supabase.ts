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
  image_url: string | null;
  video_url: string | null;
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

// Sanitize title to remove prefixes and handle malformed titles
function sanitizeTitle(title: string): string {
  // Remove TITLE: prefix (English and Arabic)
  let clean = title.replace(/^(?:TITLE|العنوان)\s*[:\-–—]\s*/i, '');

  // If it's just pipe-separated keywords, take first meaningful part
  if ((clean.match(/\|/g) || []).length >= 2) {
    const parts = clean.split('|');
    // Find first part that looks like a title (not a category keyword)
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.length >= 15 && !/^(Geopolitics|Military|Political|Economic|Intelligence|Diplomatic|Analysis|Breaking)/i.test(trimmed)) {
        return trimmed;
      }
    }
  }

  return clean.trim() || 'Untitled';
}

// Convert DB article to the format used by the frontend
// Note: `date` is a Date object - use getRelativeTime(date, locale) from time.ts for display
export function dbArticleToFrontend(article: DBArticle) {
  return {
    id: article.telegram_id,
    title: sanitizeTitle(article.title),
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
    imageUrl: article.image_url || null,
    videoUrl: article.video_url || null,
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

// ============================================
// Book Reviews
// ============================================

export interface DBBookReview {
  id: number;
  review_id: string;
  channel: 'en' | 'ar';
  book_title: string;
  author: string;
  cover_image_url: string | null;
  excerpt: string | null;
  description: string;
  key_points: string[] | null;
  rating: number | null;
  recommendation_level: 'essential' | 'recommended' | 'optional' | null;
  telegram_link: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
  last_edited_by: string | null;
}

// Fetch book reviews from Supabase
export async function fetchBookReviews(
  channel: 'en' | 'ar' = 'en',
  limit: number = 20
): Promise<DBBookReview[]> {
  const { data, error } = await supabase
    .from('book_reviews')
    .select('*')
    .eq('channel', channel)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching book reviews from Supabase:', error);
    return [];
  }

  return data || [];
}

// Convert DB book review to the format used by the frontend
export function dbBookReviewToFrontend(review: DBBookReview) {
  return {
    id: review.review_id,
    bookTitle: review.book_title,
    author: review.author,
    coverImageUrl: review.cover_image_url,
    excerpt: review.excerpt,
    description: review.description,
    keyPoints: review.key_points || [],
    rating: review.rating,
    recommendationLevel: review.recommendation_level,
    telegramLink: review.telegram_link,
    channel: review.channel,
    createdAt: new Date(review.created_at),
    status: review.status,
  };
}

// Fetch a single book review by review_id
export async function fetchBookReviewById(reviewId: string): Promise<DBBookReview | null> {
  const { data, error } = await supabase
    .from('book_reviews')
    .select('*')
    .eq('review_id', reviewId)
    .single();

  if (error) {
    console.error('Error fetching book review:', error);
    return null;
  }

  return data;
}
