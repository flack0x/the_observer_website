import { NextResponse } from "next/server";
import { fetchNewsHeadlines, dbHeadlineToTicker } from "@/lib/supabase";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

// Always fetch fresh from database
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Rate limiting - 100 requests per minute per IP (default)
  const clientId = getClientIdentifier(request);
  const { success, remaining } = rateLimit(`headlines:${clientId}`);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": remaining.toString() },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") as "en" | "ar" | null;
  const limit = parseInt(searchParams.get("limit") || "20");
  const format = searchParams.get("format") || "full"; // "full" or "ticker"

  try {
    const headlines = await fetchNewsHeadlines(language || 'en', limit);

    if (format === "ticker") {
      // Return in ticker format: ["SOURCE: Title", ...]
      const tickerItems = headlines.map(dbHeadlineToTicker);
      return NextResponse.json(tickerItems);
    }

    // Return full headline objects
    return NextResponse.json(headlines.map(h => ({
      id: h.headline_id,
      source: h.source_name,
      country: h.source_country,
      title: h.title,
      url: h.url,
      category: h.category,
      language: h.language,
      publishedAt: h.published_at,
      fetchedAt: h.fetched_at,
    })));
  } catch (error) {
    console.error("Error fetching headlines:", error);
    return NextResponse.json(
      { error: "Failed to fetch headlines" },
      { status: 500 }
    );
  }
}
