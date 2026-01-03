"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0f14] text-[#f1f5f9] antialiased">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dc2626]/10">
                <AlertTriangle className="h-8 w-8 text-[#dc2626]" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider mb-4">
              Critical Error
            </h1>

            <p className="text-[#94a3b8] mb-8">
              A critical error occurred. Please refresh the page or try again later.
            </p>

            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#dc2626] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-[#b91c1c] transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 p-4 bg-[#111920] rounded-lg border border-[#1a2332] text-left">
                <p className="text-xs text-[#64748b] font-mono break-all">
                  {error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
