import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { locales, localeDirection, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

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
    metadataBase: new URL('https://the-observer-website.vercel.app'),
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

  return (
    <html lang={validLocale} dir={direction}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800;900&family=Noto+Sans+Arabic:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`min-h-screen bg-midnight-900 text-slate-light antialiased overflow-x-hidden ${direction === 'rtl' ? 'font-arabic' : ''}`}>
        <div className="flex min-h-screen flex-col overflow-x-hidden">
          <Header locale={validLocale} dict={dict} />
          <main className="flex-1 bg-cream">{children}</main>
          <Footer locale={validLocale} dict={dict} />
        </div>
      </body>
    </html>
  );
}
