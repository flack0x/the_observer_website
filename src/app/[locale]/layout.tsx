import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { locales, localeDirection, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { fetchArticlesFromDB, dbArticleToFrontend, fetchNewsHeadlines, dbHeadlineToTicker } from "@/lib/supabase";
import { ThemeProvider } from "@/lib/theme";

// Revalidate every 30 minutes (1800 seconds) to fetch fresh headlines
export const revalidate = 1800;

// Inline script to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      const theme = localStorage.getItem('theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = theme === 'dark' || (!theme && systemDark) || (theme === 'system' && systemDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
`;

// Fetch breaking news for ticker - server-side, no loading state
// First tries external headlines, falls back to articles if none available
async function getBreakingNews(locale: Locale): Promise<string[]> {
  try {
    const language = locale === 'ar' ? 'ar' : 'en';

    // Try to fetch external headlines first
    const headlines = await fetchNewsHeadlines(language, 15);
    if (headlines.length > 0) {
      return headlines.map(dbHeadlineToTicker);
    }

    // Fallback to articles if no external headlines
    const articles = await fetchArticlesFromDB(language, 5);
    return articles.map((article) => {
      const a = dbArticleToFrontend(article);
      const prefix = a.category.toUpperCase();
      const title = a.title.length > 80 ? a.title.substring(0, 77) + "..." : a.title;
      return `${prefix}: ${title}`;
    });
  } catch {
    return [];
  }
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  return {
    metadataBase: new URL('https://al-muraqeb.com'),
    title: isArabic
      ? "المُراقِب | استخبارات وتحليل جيوسياسي"
      : "The Observer | Geopolitical Intelligence & Analysis",
    description: isArabic
      ? "تحليل جيوسياسي معمق واستخبارات عسكرية وتقييمات استراتيجية للصراعات العالمية وديناميكيات القوى."
      : "In-depth geopolitical analysis, military intelligence, and strategic assessments of global conflicts and power dynamics.",
    keywords: isArabic
      ? ["جيوسياسي", "تحليل عسكري", "استخبارات", "الشرق الأوسط", "تحليل استراتيجي"]
      : ["geopolitics", "military analysis", "intelligence", "Middle East", "strategic analysis"],
    openGraph: {
      title: isArabic ? "المُراقِب | استخبارات وتحليل جيوسياسي" : "The Observer | Geopolitical Intelligence & Analysis",
      description: isArabic
        ? "تحليل جيوسياسي معمق واستخبارات عسكرية وتقييمات استراتيجية."
        : "In-depth geopolitical analysis, military intelligence, and strategic assessments.",
      type: "website",
      locale: isArabic ? "ar_SA" : "en_US",
      alternateLocale: isArabic ? "en_US" : "ar_SA",
    },
    alternates: {
      canonical: `https://al-muraqeb.com/${locale}`,
      languages: {
        'en': 'https://al-muraqeb.com/en',
        'ar': 'https://al-muraqeb.com/ar',
        'x-default': 'https://al-muraqeb.com/en',
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const validLocale = locale as Locale;
  const direction = localeDirection[validLocale];
  const dict = getDictionary(validLocale);

  // Fetch breaking news server-side for instant display
  const breakingNews = await getBreakingNews(validLocale);

  return (
    <html lang={validLocale} dir={direction} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="6GZxTpIryls2s95Zkl3jkPxpPsYlvW3LGnEe4L6Qm2k" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800;900&family=Noto+Sans+Arabic:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`min-h-screen bg-midnight-900 text-slate-light antialiased overflow-x-hidden ${direction === 'rtl' ? 'font-arabic' : ''}`}>
        <ThemeProvider>
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-tactical-red focus:text-white focus:rounded-lg focus:font-heading focus:text-sm focus:font-bold focus:uppercase focus:tracking-wider focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-midnight-900"
          >
            {dict.common.skipToContent}
          </a>
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            <Header locale={validLocale} dict={dict} breakingNews={breakingNews} />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer locale={validLocale} dict={dict} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
