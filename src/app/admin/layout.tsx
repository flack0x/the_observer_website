import { Metadata } from 'next';
import Script from 'next/script';
import { Montserrat, Lora } from 'next/font/google';
import { Noto_Sans_Arabic } from 'next/font/google';
import '../globals.css';
import AdminLayoutClient from './AdminLayoutClient';
import { ThemeProvider } from '@/lib/theme';
import { fetchNewsHeadlines, dbHeadlineToTicker, fetchArticlesFromDB, dbArticleToFrontend } from '@/lib/supabase';
import { getDictionary } from '@/lib/i18n';

// Revalidate every 30 minutes for fresh headlines
export const revalidate = 1800;

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fetch breaking news for ticker - same as main layout
async function getBreakingNews(): Promise<string[]> {
  try {
    const headlines = await fetchNewsHeadlines('en', 30);
    if (headlines.length > 0) {
      const shuffled = shuffleArray(headlines);
      return shuffled.map(dbHeadlineToTicker);
    }
    const articles = await fetchArticlesFromDB('en', 5);
    return articles.map((article) => {
      const a = dbArticleToFrontend(article);
      const prefix = (a.category || 'NEWS').toUpperCase();
      const title = (a.title || '').length > 80 ? (a.title || '').substring(0, 77) + "..." : (a.title || '');
      return `${prefix}: ${title}`;
    });
  } catch {
    return [];
  }
}

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
  display: 'swap',
});

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

export const metadata: Metadata = {
  metadataBase: new URL('https://al-muraqeb.com'),
  title: 'Admin | The Observer',
  description: 'Content Management System for The Observer',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch breaking news server-side for instant display
  const breakingNews = await getBreakingNews();
  const dict = getDictionary('en');

  return (
    <html lang="en" suppressHydrationWarning className={`${montserrat.variable} ${lora.variable} ${notoArabic.variable}`}>
      <head>
        <meta name="google-site-verification" content="6GZxTpIryls2s95Zkl3jkPxpPsYlvW3LGnEe4L6Qm2k" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-midnight-900 text-slate-light antialiased">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0Z0P2B5QT8"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0Z0P2B5QT8');
          `}
        </Script>
        <ThemeProvider>
          <AdminLayoutClient breakingNews={breakingNews} dict={dict}>{children}</AdminLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
