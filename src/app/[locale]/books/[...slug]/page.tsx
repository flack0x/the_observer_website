import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchBookReviewById, dbBookReviewToFrontend } from "@/lib/supabase";
import BookReviewContent from "./BookReviewContent";
import { getDictionary, type Locale, locales } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ locale: string; slug: string[] }>;
}

// Fetch book review data (used by both generateMetadata and page)
async function getBookReview(slug: string[]) {
  const reviewId = slug.join("/");
  const dbReview = await fetchBookReviewById(reviewId);

  if (!dbReview) return null;

  return dbBookReviewToFrontend(dbReview);
}

// Generate dynamic metadata for each book review
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const review = await getBookReview(slug);
  const reviewId = slug.join("/");
  const isArabic = locale === 'ar';

  if (!review) {
    return {
      title: isArabic ? "المراجعة غير موجودة | المُراقِب" : "Review Not Found | The Observer",
      description: isArabic ? "لم يتم العثور على المراجعة المطلوبة." : "The requested book review could not be found.",
    };
  }

  const siteName = isArabic ? "المُراقِب" : "The Observer";
  const title = `${review.bookTitle} - Book Review | ${siteName}`;
  const description = review.excerpt || `Review of ${review.bookTitle} by ${review.author}`;

  return {
    title,
    description,
    keywords: ["book review", review.bookTitle, review.author, "geopolitics", "intelligence"],
    authors: [{ name: siteName }],
    openGraph: {
      title: `${review.bookTitle} - Book Review`,
      description,
      type: "article",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      images: review.coverImageUrl ? [
        {
          url: review.coverImageUrl,
          width: 600,
          height: 800,
          alt: review.bookTitle,
        },
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${review.bookTitle} - Book Review`,
      description,
      images: review.coverImageUrl ? [review.coverImageUrl] : [],
    },
    alternates: {
      canonical: `https://al-muraqeb.com/${locale}/books/${slug.join("/")}`,
      languages: {
        'en': `https://al-muraqeb.com/en/books/${slug.join("/")}`,
        'ar': `https://al-muraqeb.com/ar/books/${slug.join("/")}`,
        'x-default': `https://al-muraqeb.com/en/books/${slug.join("/")}`,
      },
    },
  };
}

// JSON-LD structured data for Review
function generateJsonLd(review: ReturnType<typeof dbBookReviewToFrontend>, locale: string) {
  const baseUrl = "https://al-muraqeb.com";
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Book",
      name: review.bookTitle,
      author: {
        "@type": "Person",
        name: review.author,
      },
    },
    reviewRating: review.rating ? {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
    } : undefined,
    author: {
      "@type": "Organization",
      name: locale === 'ar' ? "المُراقِب" : "The Observer",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: locale === 'ar' ? "المُراقِب" : "The Observer",
    },
    datePublished: review.createdAt.toISOString(),
    description: review.excerpt || review.description.substring(0, 200),
    inLanguage: locale === "ar" ? "ar" : "en",
  };
}

export default async function BookReviewPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const validLocale = locale as Locale;
  const dict = getDictionary(validLocale);
  const review = await getBookReview(slug);
  const isArabic = locale === 'ar';

  if (!review) {
    return (
      <div className="min-h-screen bg-midnight-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="font-heading text-2xl font-bold text-slate-light mb-4">
            {isArabic ? 'المراجعة غير موجودة' : 'Review Not Found'}
          </h1>
          <p className="text-slate-medium mb-8">
            {isArabic
              ? 'ربما تم حذف هذه المراجعة أو أن الرابط غير صحيح.'
              : 'This review may have been removed or the link is incorrect.'}
          </p>
          <Link
            href={`/${locale}/books`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-tactical-red text-white rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-tactical-red-hover transition-colors"
          >
            <ArrowLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
            {dict.books.backToBooks}
          </Link>
        </div>
      </div>
    );
  }

  const jsonLd = generateJsonLd(review, locale);

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Book review content with animations */}
      <BookReviewContent review={review} locale={validLocale} dict={dict} />
    </>
  );
}
