import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchArticleById, dbArticleToFrontend } from "@/lib/supabase";
import ArticleContent from "./ArticleContent";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

// Fetch article data (used by both generateMetadata and page)
async function getArticle(slug: string[]) {
  const articleId = slug.join("/");
  const dbArticle = await fetchArticleById(articleId);

  if (!dbArticle) return null;

  return dbArticleToFrontend(dbArticle);
}

// Generate dynamic metadata for each article
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  const articleId = slug.join("/");

  if (!article) {
    return {
      title: "Article Not Found | The Observer",
      description: "The requested article could not be found.",
    };
  }

  const title = `${article.title} | The Observer`;
  const description = article.excerpt.slice(0, 160);
  const ogImageUrl = `/api/og?id=${encodeURIComponent(articleId)}`;

  return {
    title,
    description,
    keywords: [article.category, "geopolitics", "intelligence", "analysis", "Middle East"],
    authors: [{ name: "The Observer" }],
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: article.date.toISOString(),
      authors: ["The Observer"],
      section: article.category,
      tags: [article.category, "geopolitics", "intelligence"],
      locale: article.channel === "ar" ? "ar_SA" : "en_US",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `/frontline/${slug.join("/")}`,
    },
  };
}

// JSON-LD structured data for NewsArticle
function generateJsonLd(article: ReturnType<typeof dbArticleToFrontend>) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    articleBody: article.content,
    datePublished: article.date.toISOString(),
    dateModified: article.date.toISOString(),
    author: {
      "@type": "Organization",
      name: "The Observer",
      url: "https://the-observer-website.vercel.app",
    },
    publisher: {
      "@type": "Organization",
      name: "The Observer",
      logo: {
        "@type": "ImageObject",
        url: "https://the-observer-website.vercel.app/icon-512",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://the-observer-website.vercel.app/frontline/${article.id}`,
    },
    articleSection: article.category,
    inLanguage: article.channel === "ar" ? "ar" : "en",
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-midnight-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="font-heading text-2xl font-bold text-slate-light mb-4">
            Article Not Found
          </h1>
          <p className="text-slate-medium mb-8">
            This article may have been removed or the link is incorrect.
          </p>
          <Link
            href="/frontline"
            className="inline-flex items-center gap-2 px-6 py-3 bg-tactical-red text-white rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-tactical-red-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Frontline
          </Link>
        </div>
      </div>
    );
  }

  const jsonLd = generateJsonLd(article);

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article content with animations */}
      <ArticleContent article={article} />
    </>
  );
}
