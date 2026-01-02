import { NextResponse } from "next/server";
import { getArticles, getAllArticles } from "@/lib/telegram";
import { fetchArticlesFromDB, dbArticleToFrontend } from "@/lib/supabase";

export const revalidate = 60; // Revalidate every 1 minute
export const dynamic = 'force-dynamic'; // Always fetch fresh data

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel") as "en" | "ar" | "all" | null;
  const source = searchParams.get("source"); // "db" for database only, "telegram" for telegram only

  try {
    // Try Supabase first if not explicitly requesting Telegram
    if (source !== "telegram") {
      try {
        if (channel === "all" || !channel) {
          const [enArticles, arArticles] = await Promise.all([
            fetchArticlesFromDB("en", 20),
            fetchArticlesFromDB("ar", 20),
          ]);

          // If we have articles in the database, use them
          if (enArticles.length > 0 || arArticles.length > 0) {
            return NextResponse.json({
              en: enArticles.map(dbArticleToFrontend),
              ar: arArticles.map(dbArticleToFrontend),
            }, {
              headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' }
            });
          }
        } else {
          const dbArticles = await fetchArticlesFromDB(channel, 20);

          // If we have articles in the database, use them
          if (dbArticles.length > 0) {
            const articles = dbArticles.map((article, index) => ({
              ...dbArticleToFrontend(article),
              isBreaking: index === 0,
            }));
            return NextResponse.json(articles, {
              headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' }
            });
          }
        }
      } catch (dbError) {
        console.log("Supabase not available, falling back to Telegram scraping");
      }
    }

    // Fallback to Telegram scraping
    if (channel === "all" || !channel) {
      const articles = await getAllArticles();
      return NextResponse.json(articles);
    }

    const articles = await getArticles(channel);
    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
