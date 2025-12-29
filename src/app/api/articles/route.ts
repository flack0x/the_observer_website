import { NextResponse } from "next/server";
import { getArticles, getAllArticles } from "@/lib/telegram";

export const revalidate = 300; // Revalidate every 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel") as "en" | "ar" | "all" | null;

  try {
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
