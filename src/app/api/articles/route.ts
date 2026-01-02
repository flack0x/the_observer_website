import { NextResponse } from "next/server";
import { fetchArticlesFromDB, dbArticleToFrontend } from "@/lib/supabase";

// Always fetch fresh from database
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel") as "en" | "ar" | "all" | null;
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
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
    const articles = dbArticles.map((article, index) => ({
      ...dbArticleToFrontend(article),
      isBreaking: index === 0,
    }));

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
