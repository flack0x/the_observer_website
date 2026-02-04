import { NextResponse } from "next/server";
import { fetchArticlesFromDB, dbArticleToFrontend } from "@/lib/supabase";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const BASE_URL = "https://al-muraqeb.com";

const CHANNEL_META = {
  en: {
    title: "The Observer — Geopolitical Intelligence",
    description:
      "In-depth geopolitical analysis, military intelligence, and strategic assessments of global conflicts and power dynamics.",
  },
  ar: {
    title: "المُراقِب — استخبارات وتحليل جيوسياسي",
    description:
      "تحليل جيوسياسي معمق واستخبارات عسكرية وتقييمات استراتيجية للصراعات العالمية وديناميكيات القوى.",
  },
} as const;

// Clean text for RSS XML: strip emojis, replacement chars, and non-XML-safe Unicode
function cleanForRss(str: string): string {
  // Remove U+FFFD replacement characters (appear as ? in some encodings)
  let clean = str.split('').filter(ch => ch.codePointAt(0) !== 0xFFFD).join('');
  // Remove emojis and other supplementary plane characters (U+10000+)
  clean = clean.replace(/[\u{10000}-\u{10FFFF}]/gu, '');
  // Remove variation selectors and zero-width joiners
  clean = clean.replace(/[\u{FE00}-\u{FE0F}\u{200D}]/gu, '');
  return clean.trim();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRFC2822(date: Date): string {
  return date.toUTCString();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;

  if (lang !== "en" && lang !== "ar") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const clientId = getClientIdentifier(request);
  const { success, remaining } = rateLimit(`feed:${clientId}`);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "X-RateLimit-Remaining": remaining.toString() } }
    );
  }

  const dbArticles = await fetchArticlesFromDB(lang, 50);
  const articles = dbArticles.map(dbArticleToFrontend);
  const meta = CHANNEL_META[lang];
  const feedUrl = `${BASE_URL}/feed/${lang}`;
  const siteUrl = `${BASE_URL}/${lang}/frontline`;
  const lastBuildDate =
    articles.length > 0 ? toRFC2822(articles[0].date) : toRFC2822(new Date());

  const items = articles
    .map((a) => {
      const link = `${BASE_URL}/${lang}/frontline/${a.slug}`;
      const enclosure = a.imageUrl
        ? `\n      <enclosure url="${escapeXml(a.imageUrl)}" type="image/jpeg" length="0" />`
        : "";
      return `    <item>
      <title>${escapeXml(cleanForRss(a.title))}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${cleanForRss(a.excerpt)}]]></description>
      <pubDate>${toRFC2822(a.date)}</pubDate>
      <category>${escapeXml(a.category)}</category>${enclosure}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(meta.title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(meta.description)}</description>
    <language>${lang}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/images/observer-silhouette.png</url>
      <title>${escapeXml(meta.title)}</title>
      <link>${siteUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900",
    },
  });
}
