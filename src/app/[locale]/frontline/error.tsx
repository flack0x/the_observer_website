"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function FrontlineError({ error, reset }: ErrorProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isArabic = locale === "ar";

  useEffect(() => {
    console.error("Frontline error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen bg-midnight-900 flex items-center justify-center px-4"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tactical-red/10">
            <AlertTriangle className="h-8 w-8 text-tactical-red" />
          </div>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-light mb-4">
          {isArabic ? "خطأ في تحميل التقارير" : "Error Loading Reports"}
        </h1>

        <p className="text-slate-medium mb-8">
          {isArabic
            ? "تعذر تحميل التقارير الاستخباراتية. يرجى المحاولة مرة أخرى."
            : "Unable to load intelligence reports. Please try again."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-tactical-red text-white rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-tactical-red-hover transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            {isArabic ? "حاول مرة أخرى" : "Try Again"}
          </button>

          <Link
            href={`/${locale}`}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-midnight-700 text-slate-light rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-midnight-600 border border-midnight-600 transition-colors`}
          >
            <ArrowLeft className={`h-4 w-4 ${isArabic ? "rotate-180" : ""}`} />
            {isArabic ? "العودة" : "Go Back"}
          </Link>
        </div>
      </div>
    </div>
  );
}
