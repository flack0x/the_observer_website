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
    let title = "";

    // Look for a good title line (should be substantial but not too long)
    for (const line of lines.slice(0, 3)) {
      const cleaned = cleanTitle(line);
      // Good title: between 20-200 chars, contains letters
      if (cleaned.length >= 20 && cleaned.length <= 200 && /[a-zA-Z\u0600-\u06FF]/.test(cleaned)) {
        title = cleaned;
        break;
      }
    }

    // Fallback: use first line
    if (!title) {
      title = cleanTitle(lines[0] || "Untitled");
    }

    // Truncate if still too long
    if (title.length > 150) {
      // Try to cut at a colon or dash for cleaner truncation
      const colonIndex = title.indexOf(":");
      const dashIndex = title.indexOf("–");
      const cutPoint = colonIndex > 30 ? colonIndex : (dashIndex > 30 ? dashIndex : 147);
      title = title.substring(0, Math.min(cutPoint + 1, 147)).trim();
      if (!title.endsWith(":") && !title.endsWith("–")) {
        title += "...";
      }
    }

    // Find where title ends in the original lines
    const titleLineIndex = lines.findIndex(l => cleanTitle(l) === title || cleanTitle(l).startsWith(title.replace("...", "")));

    // Rest is the excerpt - skip title line
    const startIndex = titleLineIndex >= 0 ? titleLineIndex + 1 : 1;
    const excerptLines = lines.slice(startIndex, startIndex + 6)
      .map(l => cleanTitle(l))
      .filter(l => l.length > 20 && !l.startsWith("Link to") && !l.startsWith("🔵") && !l.includes("@observer"));

    let excerpt = excerptLines.join(" ").substring(0, 400);

    // Clean up excerpt - cut at sentence boundary if possible
    if (excerpt.length > 350) {
      const lastPeriod = excerpt.lastIndexOf(".", 350);
      if (lastPeriod > 200) {
        excerpt = excerpt.substring(0, lastPeriod + 1);
      } else {
        excerpt = excerpt.substring(0, excerpt.lastIndexOf(" ", 350)) + "...";
      }
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
    lowerText.includes("breaking") ||
    lowerText.includes("urgent") ||
    lowerText.includes("عاجل")
  ) {
    return "Breaking";
  }
  if (
    lowerText.includes("military") ||
    lowerText.includes("weapon") ||
    lowerText.includes("army") ||
    lowerText.includes("forces") ||
    lowerText.includes("troops") ||
    lowerText.includes("battlefield") ||
    lowerText.includes("عسكري")
  ) {
    return "Military";
  }
  if (
    lowerText.includes("economic") ||
    lowerText.includes("sanction") ||
    lowerText.includes("dollar") ||
    lowerText.includes("gas deal") ||
    lowerText.includes("trade") ||
    lowerText.includes("اقتصاد")
  ) {
    return "Economic";
  }
  if (
    lowerText.includes("intelligence") ||
    lowerText.includes("leaked") ||
    lowerText.includes("exposed") ||
    lowerText.includes("covert") ||
    lowerText.includes("استخبارات")
  ) {
    return "Intelligence";
  }
  if (
    lowerText.includes("saudi") ||
    lowerText.includes("emirati") ||
    lowerText.includes("yemen") ||
    lowerText.includes("gaza") ||
    lowerText.includes("israel") ||
    lowerText.includes("iran") ||
    lowerText.includes("coalition") ||
    lowerText.includes("withdrawal") ||
    lowerText.includes("alliance") ||
    lowerText.includes("سياسي")
  ) {
    return "Political";
  }
  if (
    lowerText.includes("diplomatic") ||
    lowerText.includes("negotiation") ||
    lowerText.includes("summit") ||
    lowerText.includes("دبلوماسي")
  ) {
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
