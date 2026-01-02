// Telegram Channel Fetcher for Public Channels
// Fetches posts from t.me/s/channelname (public preview)

export interface TelegramPost {
  id: string;
  date: string;
  timestamp: number;
  text: string;
  html: string;
  views?: string;
  link: string;
  channel: string;
}

export interface ParsedArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  timestamp: string;
  date: Date;
  link: string;
  channel: "en" | "ar";
  category: string;
  isBreaking: boolean;
}

// Channel configuration
export const CHANNELS = {
  en: {
    username: "observer_5",
    name: "The Observer",
    url: "https://t.me/s/observer_5",
  },
  ar: {
    username: "almuraqb",
    name: "المراقب",
    url: "https://t.me/s/almuraqb",
  },
} as const;

// Emoji pattern for cleaning
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]|🔴|🔵|🟢|🟡|⚫|⚪|🔻|🔺|📌|🖋|👍|✅|❌|⚠️|🚨|📢|📣/gu;

// Fetch posts from a public Telegram channel
export async function fetchTelegramChannel(
  channel: "en" | "ar"
): Promise<TelegramPost[]> {
  const channelConfig = CHANNELS[channel];

  try {
    const response = await fetch(channelConfig.url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch channel: ${response.status}`);
    }

    const html = await response.text();
    return parseChannelHTML(html, channelConfig.username);
  } catch (error) {
    console.error(`Error fetching ${channel} channel:`, error);
    return [];
  }
}

// Parse the HTML from Telegram's public preview
function parseChannelHTML(html: string, channelUsername: string): TelegramPost[] {
  const posts: TelegramPost[] = [];

  // Multiple regex patterns to handle different Telegram HTML structures
  const patterns = [
    // Pattern 1: Standard message text div
    /data-post="([^"]+)"[\s\S]*?<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div class="tgme_widget_message_footer|<\/div>\s*<\/div>)/g,
    // Pattern 2: Simpler pattern
    /data-post="([^"]+)"[\s\S]*?js-message_text[^>]*>([\s\S]*?)<\/div>/g,
    // Pattern 3: Even simpler fallback
    /data-post="([^"]+)"[\s\S]*?message_text[^>]*>([\s\S]*?)<\/div>/g,
  ];

  const seenIds = new Set<string>();

  for (const pattern of patterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);

    while ((match = regex.exec(html)) !== null) {
      const postId = match[1];

      // Skip if we've already processed this post
      if (seenIds.has(postId)) continue;
      seenIds.add(postId);

      const textHtml = match[2];

      // Clean up the text
      const text = textHtml
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();

      if (text.length > 100) {
        // Only include substantial posts (increased threshold)
        posts.push({
          id: postId,
          date: new Date().toISOString(),
          timestamp: Date.now() - (posts.length * 3600000), // Stagger timestamps
          text: text,
          html: textHtml,
          link: `https://t.me/${postId}`,
          channel: channelUsername,
        });
      }
    }

    // If we found posts with this pattern, don't try other patterns
    if (posts.length > 0) break;
  }

  // Sort by ID descending (newer posts have higher IDs) and return last 20
  return posts
    .sort((a, b) => {
      const idA = parseInt(a.id.split('/')[1] || '0');
      const idB = parseInt(b.id.split('/')[1] || '0');
      return idB - idA;
    })
    .slice(0, 20);
}

// Clean up text by removing emojis and markdown
function cleanText(text: string): string {
  return text
    .replace(EMOJI_REGEX, "")
    .replace(/[_*]{1,2}/g, "") // Remove markdown bold/italic
    .replace(/\s+/g, " ")
    .trim();
}

// Extract title from post text - improved logic
function extractTitle(text: string): string {
  // First, try to find bold text at the start (markdown format: **title**)
  const boldMatch = text.match(/^\s*(?:[_*]*[🔴🔵📌🖋]*[_*]*)?\s*\*\*([^*]+)\*\*/);
  if (boldMatch) {
    const title = cleanText(boldMatch[1]);
    if (title.length >= 15 && title.length <= 300) {
      return title.length > 250 ? title.substring(0, 250) : title;
    }
  }

  // Fallback: Look for the first substantial line
  const lines = text.split("\n").filter((line) => line.trim());

  for (const line of lines.slice(0, 5)) {
    // Skip lines that are just links or channel mentions
    if (line.startsWith("http") || line.startsWith("@") || line.includes("Link to")) {
      continue;
    }
    if (line.includes("t.me/") && line.length < 50) {
      continue;
    }

    const cleaned = cleanText(line);

    // Check if it looks like a title
    const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(cleaned);
    const isReasonableLength = cleaned.length >= 15 && cleaned.length <= 300;

    // Skip section headers like "V. Yemen and..." or numbered items
    const isSectionHeader = /^[IVX]+\.\s|^\d+\.\s|^[أ-ي]\.\s/.test(cleaned);

    if (hasLetters && isReasonableLength && !isSectionHeader) {
      return cleaned.length > 250 ? cleaned.substring(0, 250) : cleaned;
    }
  }

  // Last resort: first line
  if (lines.length > 0) {
    const cleaned = cleanText(lines[0]);
    return cleaned.length > 250 ? cleaned.substring(0, 250) : cleaned;
  }

  return "Untitled";
}

// Extract excerpt from post text
function extractExcerpt(text: string, title: string): string {
  const lines = text.split("\n").filter((line) => line.trim());

  // Find where the title is and start after it
  let startIdx = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const cleaned = cleanText(lines[i]);
    if (title.includes(cleaned) || cleaned.includes(title)) {
      startIdx = i + 1;
      break;
    }
  }

  // Collect excerpt lines
  const excerptParts: string[] = [];
  for (const line of lines.slice(startIdx, startIdx + 8)) {
    const cleaned = cleanText(line);

    // Skip links, channel mentions, and very short lines
    if (
      line.includes("http") ||
      line.includes("t.me/") ||
      line.includes("@observer") ||
      line.includes("@almuraqb") ||
      line.includes("Link to")
    ) {
      continue;
    }
    if (cleaned.length < 20) continue;

    excerptParts.push(cleaned);

    // Stop if we have enough content
    if (excerptParts.join(" ").length > 300) break;
  }

  let excerpt = excerptParts.join(" ");

  // Trim to ~350 chars at a sentence boundary
  if (excerpt.length > 350) {
    const lastPeriod = excerpt.lastIndexOf(".", 350);
    if (lastPeriod > 100) {
      excerpt = excerpt.substring(0, lastPeriod + 1);
    } else {
      const lastSpace = excerpt.lastIndexOf(" ", 350);
      if (lastSpace > 100) {
        excerpt = excerpt.substring(0, lastSpace) + "...";
      } else {
        excerpt = excerpt.substring(0, 347) + "...";
      }
    }
  }

  return excerpt || title;
}

// Detect article category from content - improved with more keywords
function detectCategory(text: string): string {
  const lowerText = text.toLowerCase();

  // Breaking/Urgent
  const breakingKeywords = ["breaking", "urgent", "عاجل", "خبر عاجل", "طارئ"];
  if (breakingKeywords.some((word) => lowerText.includes(word))) {
    return "Breaking";
  }

  // Military
  const militaryKeywords = [
    "military", "weapon", "army", "forces", "troops", "battlefield", "missile",
    "drone", "strike", "attack", "defense", "war", "combat", "artillery",
    "عسكري", "جيش", "قوات", "صاروخ", "طائرة مسيرة", "ضربة", "هجوم", "دفاع",
    "حرب", "معركة", "سلاح", "انسحاب"
  ];
  if (militaryKeywords.some((word) => lowerText.includes(word))) {
    return "Military";
  }

  // Intelligence
  const intelKeywords = [
    "intelligence", "leaked", "exposed", "covert", "secret", "spy", "agent",
    "استخبارات", "تسريب", "كشف", "سري", "جاسوس", "عميل"
  ];
  if (intelKeywords.some((word) => lowerText.includes(word))) {
    return "Intelligence";
  }

  // Economic
  const economicKeywords = [
    "economic", "economy", "sanction", "dollar", "trade", "oil", "gas",
    "market", "financial", "bank", "currency",
    "اقتصاد", "اقتصادي", "عقوبات", "دولار", "تجارة", "نفط", "غاز", "سوق", "بنك"
  ];
  if (economicKeywords.some((word) => lowerText.includes(word))) {
    return "Economic";
  }

  // Political
  const politicalKeywords = [
    "saudi", "emirati", "yemen", "gaza", "israel", "iran", "coalition",
    "government", "president", "minister", "parliament", "election", "vote",
    "سعودي", "إماراتي", "يمن", "غزة", "إسرائيل", "إيران", "تحالف",
    "حكومة", "رئيس", "وزير", "برلمان", "انتخاب", "سياسي", "سياسة"
  ];
  if (politicalKeywords.some((word) => lowerText.includes(word))) {
    return "Political";
  }

  // Diplomatic
  const diplomaticKeywords = [
    "diplomatic", "diplomacy", "negotiation", "summit", "treaty", "agreement",
    "ambassador", "embassy", "talks",
    "دبلوماسي", "دبلوماسية", "مفاوضات", "قمة", "معاهدة", "اتفاق", "سفير", "سفارة"
  ];
  if (diplomaticKeywords.some((word) => lowerText.includes(word))) {
    return "Diplomatic";
  }

  return "Analysis";
}

// Generate relative timestamps for display
function getRelativeTime(index: number): string {
  const times = [
    "Just now",
    "1 hour ago",
    "2 hours ago",
    "5 hours ago",
    "8 hours ago",
    "12 hours ago",
    "1 day ago",
    "2 days ago",
    "3 days ago",
    "4 days ago",
  ];
  return times[Math.min(index, times.length - 1)];
}

// Check if post is a valid article (not just a link or short post)
function isValidArticle(text: string): boolean {
  if (!text || text.length < 150) return false;

  const lines = text.split("\n").filter((l) => l.trim());
  const linkLines = lines.filter(
    (l) => l.includes("t.me/") || l.startsWith("http")
  ).length;

  // Skip if it's primarily links
  if (lines.length <= 3 && linkLines >= lines.length - 1) return false;

  // Must have substantial text content
  const cleaned = cleanText(text);
  if (cleaned.length < 100) return false;

  return true;
}

// Convert raw posts to structured articles
export function parsePostsToArticles(
  posts: TelegramPost[],
  channel: "en" | "ar"
): ParsedArticle[] {
  return posts
    .filter((post) => isValidArticle(post.text))
    .map((post, index) => {
      const title = extractTitle(post.text);
      const excerpt = extractExcerpt(post.text, title);
      const category = detectCategory(post.text);
      const timestamp = getRelativeTime(index);

      return {
        id: post.id,
        title: title,
        excerpt: excerpt,
        content: post.text,
        timestamp: timestamp,
        date: new Date(),
        link: post.link,
        channel: channel,
        category: category,
        isBreaking: index === 0, // Most recent post is "breaking"
      };
    });
}

// Main function to get articles for the website
export async function getArticles(channel: "en" | "ar" = "en"): Promise<ParsedArticle[]> {
  const posts = await fetchTelegramChannel(channel);
  return parsePostsToArticles(posts, channel);
}

// Get articles from both channels
export async function getAllArticles(): Promise<{
  en: ParsedArticle[];
  ar: ParsedArticle[];
}> {
  const [en, ar] = await Promise.all([
    getArticles("en"),
    getArticles("ar"),
  ]);

  return { en, ar };
}
