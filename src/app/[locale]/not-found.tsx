import Link from "next/link";
import { Eye, Home, ArrowLeft } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";
import { headers } from "next/headers";

export default async function NotFound() {
  // Extract locale from the URL path
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";
  const localeMatch = pathname.match(/^\/(en|ar)/);
  const locale: Locale = localeMatch ? (localeMatch[1] as Locale) : "en";

  const dict = getDictionary(locale);
  const isArabic = locale === "ar";

  return (
    <div className="min-h-screen bg-midnight-900 flex items-center justify-center px-4" dir={isArabic ? "rtl" : "ltr"}>
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-midnight-800 border border-midnight-700">
            <Eye className="h-10 w-10 text-slate-dark" />
          </div>
        </div>

        <h1 className="font-heading text-6xl font-bold text-tactical-red mb-4">
          404
        </h1>

        <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-light mb-4">
          {dict.notFound.title}
        </h2>

        <p className="text-slate-medium mb-8">
          {dict.notFound.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-tactical-red text-white rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-tactical-red-hover transition-colors"
          >
            <Home className="h-4 w-4" />
            {dict.notFound.goHome}
          </Link>

          <Link
            href={`/${locale}/frontline`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-midnight-700 text-slate-light rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-midnight-600 border border-midnight-600 transition-colors"
          >
            <ArrowLeft className={`h-4 w-4 ${isArabic ? "rotate-180" : ""}`} />
            {dict.nav.frontline}
          </Link>
        </div>
      </div>
    </div>
  );
}
