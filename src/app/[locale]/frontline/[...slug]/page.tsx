import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchArticleById, dbArticleToFrontend } from "@/lib/supabase";
import ArticleContent from "./ArticleContent";
import { getDictionary, type Locale, locales } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ locale: string; slug: string[] }>;
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
  const { locale, slug } = await params;
  const article = await getArticle(slug);
  const articleId = slug.join("/");
  const isArabic = locale === 'ar';

  if (!article) {
    return {
      title: isArabic ? "المقال غير موجود | المُراقِب" : "Article Not Found | The Observer",
      description: isArabic ? "لم يتم العثور على المقال المطلوب." : "The requested article could not be found.",
    };
  }

  const siteName = isArabic ? "المُراقِب" : "The Observer";
  const title = `${article.title} | ${siteName}`;
  const description = article.excerpt.slice(0, 160);
  const ogImageUrl = `/api/og?id=${encodeURIComponent(articleId)}`;

  return {
    title,
    description,
    keywords: [article.category, "geopolitics", "intelligence", "analysis", "Middle East"],
    authors: [{ name: siteName }],
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: article.date.toISOString(),
      authors: [siteName],
      section: article.category,
      tags: [article.category, "geopolitics", "intelligence"],
      locale: locale === "ar" ? "ar_SA" : "en_US",
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
      canonical: `https://al-muraqeb.com/${locale}/frontline/${slug.join("/")}`,
      languages: {
        'en': `https://al-muraqeb.com/en/frontline/${slug.join("/")}`,
        'ar': `https://al-muraqeb.com/ar/frontline/${slug.join("/")}`,
        'x-default': `https://al-muraqeb.com/en/frontline/${slug.join("/")}`,
      },
    },
  };
}

// JSON-LD structured data for NewsArticle
function generateJsonLd(article: ReturnType<typeof dbArticleToFrontend>, locale: string) {
  const baseUrl = "https://al-muraqeb.com";
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
      name: locale === 'ar' ? "المُراقِب" : "The Observer",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: locale === 'ar' ? "المُراقِب" : "The Observer",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon-512`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/${locale}/frontline/${article.id}`,
    },
    articleSection: article.category,
    inLanguage: locale === "ar" ? "ar" : "en",
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const validLocale = locale as Locale;
  const dict = getDictionary(validLocale);
  const article = await getArticle(slug);
  const isArabic = locale === 'ar';

  if (!article) {
    return (
      <div className="min-h-screen bg-midnight-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="font-heading text-2xl font-bold text-slate-light mb-4">
            {isArabic ? 'المقال غير موجود' : 'Article Not Found'}
          </h1>
          <p className="text-slate-medium mb-8">
            {isArabic
              ? 'ربما تم حذف هذا المقال أو أن الرابط غير صحيح.'
              : 'This article may have been removed or the link is incorrect.'}
          </p>
          <Link
            href={`/${locale}/frontline`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-tactical-red text-white rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-tactical-red-hover transition-colors"
          >
            <ArrowLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
            {dict.frontline.backToFrontline}
          </Link>
        </div>
      </div>
    );
  }

  const jsonLd = generateJsonLd(article, locale);

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article content with animations */}
      <ArticleContent article={article} locale={validLocale} dict={dict} />
    </>
  );
}
