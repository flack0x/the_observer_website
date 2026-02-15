import { NextResponse } from "next/server";
import { fetchArticlesFromDB, searchArticles, dbArticleToFrontend } from "@/lib/supabase";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

// Always fetch fresh from database
export const dynamic = 'force-dynamic';

// Run function closer to Supabase (Mumbai)
export const preferredRegion = 'bom1';

export async function GET(request: Request) {
  // Rate limiting - 100 requests per minute per IP (default)
  const clientId = getClientIdentifier(request);
  const { success, remaining } = rateLimit(`articles:${clientId}`);

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
  const channel = searchParams.get("channel") as "en" | "ar" | "all" | null;
  const limit = parseInt(searchParams.get("limit") || "500");
  const search = searchParams.get("search")?.trim();

  try {
    // Full-text search mode
    if (search && search.length >= 2 && channel && channel !== "all") {
      const dbArticles = await searchArticles(search, channel, Math.min(limit, 50));
      return NextResponse.json(dbArticles.map(dbArticleToFrontend));
    }

    if (channel === "all" || !channel) {
      // Fetch both channels
      const [enArticles, arArticles] = await Promise.all([
        fetchArticlesFromDB("en", limit),
        fetchArticlesFromDB("ar", limit),
      ]);

      return NextResponse.json({
        en: enArticles.map(dbArticleToFrontend),
        ar: arArticles.map(dbArticleToFrontend),
      });
    }

    // Fetch single channel
    const dbArticles = await fetchArticlesFromDB(channel, limit);
    const articles = dbArticles.map(dbArticleToFrontend);

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
