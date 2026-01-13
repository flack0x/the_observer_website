import { NextResponse } from "next/server";
import { fetchBookReviews, dbBookReviewToFrontend } from "@/lib/supabase";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

// Always fetch fresh from database
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Rate limiting - 100 requests per minute per IP (default)
  const clientId = getClientIdentifier(request);
  const { success, remaining } = rateLimit(`books:${clientId}`);

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
  const channel = searchParams.get("channel") as "en" | "ar" | null;
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    // Fetch book reviews for the specified channel
    const dbBookReviews = await fetchBookReviews(channel || 'en', limit);
    const bookReviews = dbBookReviews.map(dbBookReviewToFrontend);

    return NextResponse.json(bookReviews);
  } catch (error) {
    console.error("Error fetching book reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch book reviews" },
      { status: 500 }
    );
  }
}
