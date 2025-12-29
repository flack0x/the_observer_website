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

  // Match message containers
  const messageRegex =
    /<div class="tgme_widget_message_wrap[^"]*"[^>]*>[\s\S]*?<div class="tgme_widget_message text_not_supported_wrap[^"]*"[^>]*data-post="([^"]+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;

  // Simpler regex to find message blocks
  const simpleMessageRegex =
    /data-post="([^"]+)"[\s\S]*?<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/g;

  let match;
  while ((match = simpleMessageRegex.exec(html)) !== null) {
    const postId = match[1];
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
      .trim();

    if (text.length > 50) {
      // Only include substantial posts
      posts.push({
        id: postId,
        date: new Date().toISOString(), // Will be updated if we can parse date
        timestamp: Date.now(),
        text: text,
        html: textHtml,
        link: `https://t.me/${postId}`,
        channel: channelUsername,
      });
    }
  }

  return posts.slice(0, 20); // Return last 20 posts
}

// Clean up title text
function cleanTitle(text: string): string {
  return text
    // Remove common emojis
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "")
    .replace(/[\u{2700}-\u{27BF}]/gu, "")
    .replace(/🔴|🔵|🟢|🟡|⚫|⚪|🔻|🔺/g, "")
    // Remove leading/trailing symbols
    .replace(/^[\s\-–—:•*#]+/, "")
    .replace(/[\s\-–—:•*#]+$/, "")
    .trim();
}

// Convert raw posts to structured articles
export function parsePostsToArticles(
  posts: TelegramPost[],
  channel: "en" | "ar"
): ParsedArticle[] {
  return posts.map((post, index) => {
    const lines = post.text.split("\n").filter((line) => line.trim());

    // First substantial line is usually the title/headline
    let title = cleanTitle(lines[0] || "Untitled");

    // If title is too short, try to get more context
    if (title.length < 20 && lines.length > 1) {
      title = cleanTitle(lines.slice(0, 2).join(" - "));
    }

    // Truncate if too long
    if (title.length > 120) {
      title = title.substring(0, 117) + "...";
    }

    // Rest is the excerpt - skip first line(s) used for title
    const excerptLines = lines.slice(1, 5).map(l => cleanTitle(l)).filter(l => l.length > 10);
    let excerpt = excerptLines.join(" ").substring(0, 350);

    // Clean up excerpt
    if (excerpt.length > 300) {
      excerpt = excerpt.substring(0, excerpt.lastIndexOf(" ", 300)) + "...";
    }

    // Determine category based on content
    const category = detectCategory(post.text);

    // Calculate relative time
    const timestamp = getRelativeTime(index);

    return {
      id: post.id,
      title: title,
      excerpt: excerpt || title,
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

// Detect article category from content
function detectCategory(text: string): string {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("military") ||
    lowerText.includes("weapon") ||
    lowerText.includes("army") ||
    lowerText.includes("forces") ||
    lowerText.includes("عسكري")
  ) {
    return "Military";
  }
  if (
    lowerText.includes("economic") ||
    lowerText.includes("sanction") ||
    lowerText.includes("dollar") ||
    lowerText.includes("gas deal") ||
    lowerText.includes("اقتصاد")
  ) {
    return "Economic";
  }
  if (
    lowerText.includes("intelligence") ||
    lowerText.includes("leaked") ||
    lowerText.includes("exposed") ||
    lowerText.includes("استخبارات")
  ) {
    return "Intelligence";
  }
  if (
    lowerText.includes("diplomatic") ||
    lowerText.includes("negotiation") ||
    lowerText.includes("summit") ||
    lowerText.includes("دبلوماسي")
  ) {
    return "Diplomatic";
  }
  if (
    lowerText.includes("breaking") ||
    lowerText.includes("urgent") ||
    lowerText.includes("عاجل")
  ) {
    return "Breaking";
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
