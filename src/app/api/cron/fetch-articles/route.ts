import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role key for write access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Channel configuration
const CHANNELS = {
  en: {
    username: 'observer_5',
    url: 'https://t.me/s/observer_5',
  },
  ar: {
    username: 'almuraqb',
    url: 'https://t.me/s/almuraqb',
  },
} as const;

// Emoji pattern for cleaning
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]|🔴|🔵|🟢|🟡|⚫|⚪|🔻|🔺|📌|🖋|👍|✅|❌|⚠️|🚨|📢|📣/gu;

function cleanText(text: string): string {
  return text
    .replace(EMOJI_REGEX, '')
    .replace(/[_*]{1,2}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(text: string): string {
  const lines = text.split('\n').filter((line) => line.trim());
  const firstLines = lines.slice(0, 3).join('\n');

  // Look for bold title at start
  const boldMatch = firstLines.match(/^\s*(?:[_*]*[🔴🔵📌🖋]*[_*]*)?\s*\*\*([^*\n]+)\*\*/);
  if (boldMatch) {
    const title = cleanText(boldMatch[1]);
    if (title.length >= 20 && title.length <= 300) {
      return title.length > 250 ? title.substring(0, 250) : title;
    }
  }

  // Fallback: first substantial line
  for (const line of lines.slice(0, 5)) {
    if (line.startsWith('http') || line.startsWith('@') || line.includes('Link to')) continue;
    if (line.includes('t.me/') && line.length < 50) continue;
    if (line.startsWith('[') && line.includes('](')) continue;

    const cleaned = cleanText(line);
    const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(cleaned);
    const isReasonableLength = cleaned.length >= 20 && cleaned.length <= 300;
    const isSectionHeader = /^[IVX]+\.?\s|^\d+\.?\s|^[أ-ي]\.?\s/.test(cleaned);
    const isConclusion = ['conclusion', 'الخاتمة', 'خاتمة', 'introduction', 'مقدمة'].includes(cleaned.toLowerCase());

    if (hasLetters && isReasonableLength && !isSectionHeader && !isConclusion) {
      return cleaned.length > 250 ? cleaned.substring(0, 250) : cleaned;
    }
  }

  // Generate from content
  for (const line of lines.slice(0, 5)) {
    const cleaned = cleanText(line);
    if (cleaned.length >= 50) {
      if (cleaned.length > 100) {
        for (const punct of ['. ', ': ', ' - ', ', ']) {
          const idx = cleaned.indexOf(punct, 40);
          if (idx > 0 && idx < 100) return cleaned.substring(0, idx + 1).trim();
        }
        return cleaned.substring(0, 97) + '...';
      }
      return cleaned;
    }
  }

  return lines[0] ? cleanText(lines[0]).substring(0, 250) : 'Untitled';
}

function extractExcerpt(text: string, title: string): string {
  const lines = text.split('\n').filter((line) => line.trim());
  let startIdx = 0;

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const cleaned = cleanText(lines[i]);
    if (title.includes(cleaned) || cleaned.includes(title)) {
      startIdx = i + 1;
      break;
    }
  }

  const excerptParts: string[] = [];
  for (const line of lines.slice(startIdx, startIdx + 8)) {
    const cleaned = cleanText(line);
    if (line.includes('http') || line.includes('t.me/') || line.includes('@observer') || line.includes('@almuraqb')) continue;
    if (cleaned.length < 20) continue;
    excerptParts.push(cleaned);
    if (excerptParts.join(' ').length > 300) break;
  }

  let excerpt = excerptParts.join(' ');
  if (excerpt.length > 350) {
    const lastPeriod = excerpt.lastIndexOf('.', 350);
    if (lastPeriod > 100) {
      excerpt = excerpt.substring(0, lastPeriod + 1);
    } else {
      excerpt = excerpt.substring(0, 347) + '...';
    }
  }

  return excerpt || title;
}

function detectCategory(text: string): string {
  const lowerText = text.toLowerCase();

  const categories = [
    { name: 'Breaking', keywords: ['breaking', 'urgent', 'عاجل', 'خبر عاجل'] },
    { name: 'Military', keywords: ['military', 'weapon', 'army', 'forces', 'missile', 'drone', 'strike', 'عسكري', 'جيش', 'صاروخ', 'انسحاب'] },
    { name: 'Intelligence', keywords: ['intelligence', 'leaked', 'exposed', 'covert', 'استخبارات', 'تسريب'] },
    { name: 'Economic', keywords: ['economic', 'sanction', 'dollar', 'trade', 'oil', 'اقتصاد', 'عقوبات', 'نفط'] },
    { name: 'Political', keywords: ['saudi', 'emirati', 'yemen', 'gaza', 'israel', 'iran', 'سعودي', 'إماراتي', 'يمن', 'غزة', 'سياسي'] },
    { name: 'Diplomatic', keywords: ['diplomatic', 'negotiation', 'summit', 'treaty', 'دبلوماسي', 'مفاوضات', 'قمة'] },
  ];

  for (const cat of categories) {
    if (cat.keywords.some((kw) => lowerText.includes(kw))) {
      return cat.name;
    }
  }

  return 'Analysis';
}

async function fetchChannel(channelKey: 'en' | 'ar') {
  const channel = CHANNELS[channelKey];

  const response = await fetch(channel.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${channelKey}: ${response.status}`);
  }

  const html = await response.text();
  const articles: Array<{
    telegram_id: string;
    channel: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    telegram_link: string;
    telegram_date: string;
  }> = [];

  // Parse posts from HTML
  const pattern = /data-post="([^"]+)"[\s\S]*?<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div class="tgme_widget_message_footer|<\/div>\s*<\/div>)/g;
  const datePattern = /data-post="([^"]+)"[\s\S]*?<time[^>]*datetime="([^"]+)"/g;

  // Extract dates
  const dates: Record<string, string> = {};
  let dateMatch;
  while ((dateMatch = datePattern.exec(html)) !== null) {
    dates[dateMatch[1]] = dateMatch[2];
  }

  let match;
  while ((match = pattern.exec(html)) !== null) {
    const postId = match[1];
    const textHtml = match[2];

    const text = textHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    // Skip short posts or link-only posts
    if (text.length < 150) continue;
    const lines = text.split('\n').filter(l => l.trim());
    const linkLines = lines.filter(l => l.includes('t.me/') || l.startsWith('http')).length;
    if (lines.length <= 3 && linkLines >= lines.length - 1) continue;

    const title = extractTitle(text);
    const excerpt = extractExcerpt(text, title);
    const category = detectCategory(text);

    articles.push({
      telegram_id: postId,
      channel: channelKey,
      title,
      excerpt,
      content: text,
      category,
      telegram_link: `https://t.me/${postId}`,
      telegram_date: dates[postId] || new Date().toISOString(),
    });
  }

  return articles;
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting scheduled article fetch...');

    // Fetch from both channels
    const [enArticles, arArticles] = await Promise.all([
      fetchChannel('en'),
      fetchChannel('ar'),
    ]);

    const allArticles = [...enArticles, ...arArticles];
    console.log(`Fetched ${allArticles.length} articles (EN: ${enArticles.length}, AR: ${arArticles.length})`);

    // Upsert to Supabase
    let successCount = 0;
    let errorCount = 0;

    for (const article of allArticles) {
      try {
        await supabase
          .from('articles')
          .upsert(article, { onConflict: 'telegram_id' });
        successCount++;
      } catch (err) {
        errorCount++;
        console.error(`Error upserting ${article.telegram_id}:`, err);
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      fetched: allArticles.length,
      english: enArticles.length,
      arabic: arArticles.length,
      upserted: successCount,
      errors: errorCount,
    };

    console.log('Fetch complete:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cron fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles', details: String(error) },
      { status: 500 }
    );
  }
}
