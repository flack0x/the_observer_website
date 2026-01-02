import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { fetchArticleById } from "@/lib/supabase";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("id");

  let title = "The Observer";
  let category = "Intelligence";

  if (articleId) {
    const article = await fetchArticleById(articleId);
    if (article) {
      title = article.title;
      category = article.category;
    }
  }

  // Truncate title if too long
  const displayTitle = title.length > 100 ? title.substring(0, 97) + "..." : title;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0f1419",
          backgroundImage: "linear-gradient(135deg, #0f1419 0%, #1b3a57 50%, #0f1419 100%)",
          padding: 60,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          {/* Logo and brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c9a227"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 14c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
              <path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9" />
            </svg>
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#e8eaed",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              The Observer
            </span>
          </div>

          {/* Category badge */}
          <div
            style={{
              display: "flex",
              padding: "8px 20px",
              backgroundColor: "rgba(185, 28, 28, 0.9)",
              borderRadius: 6,
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#ffffff",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {category}
            </span>
          </div>
        </div>

        {/* Title area */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: displayTitle.length > 60 ? 42 : 52,
              fontWeight: 800,
              color: "#e8eaed",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "100%",
            }}
          >
            {displayTitle}
          </h1>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 24,
          }}
        >
          <span
            style={{
              fontSize: 18,
              color: "#9aa0a6",
              letterSpacing: "0.05em",
            }}
          >
            Geopolitical Intelligence & Analysis
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              backgroundColor: "rgba(201, 162, 39, 0.15)",
              borderRadius: 6,
              border: "1px solid rgba(201, 162, 39, 0.3)",
            }}
          >
            <span style={{ color: "#c9a227", fontSize: 14 }}>
              the-observer-website.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
