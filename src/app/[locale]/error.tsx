"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isArabic = locale === "ar";

  useEffect(() => {
    // Log error to console (could send to error tracking service)
    console.error("Page error:", error);
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
          {isArabic ? "حدث خطأ" : "Something Went Wrong"}
        </h1>

        <p className="text-slate-medium mb-8">
          {isArabic
            ? "عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
            : "Sorry, an unexpected error occurred. Please try again."}
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
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-midnight-700 text-slate-light rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-midnight-600 border border-midnight-600 transition-colors"
          >
            <Home className="h-4 w-4" />
            {isArabic ? "الرئيسية" : "Go Home"}
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-midnight-800 rounded-lg border border-midnight-700 text-left">
            <p className="text-xs text-slate-dark font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
