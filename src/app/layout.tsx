import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "The Observer | Geopolitical Intelligence & Analysis",
  description:
    "In-depth geopolitical analysis, military intelligence, and strategic assessments of global conflicts and power dynamics.",
  keywords: [
    "geopolitics",
    "military analysis",
    "intelligence",
    "Middle East",
    "strategic analysis",
    "conflict analysis",
  ],
  openGraph: {
    title: "The Observer | Geopolitical Intelligence & Analysis",
    description:
      "In-depth geopolitical analysis, military intelligence, and strategic assessments.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Observer",
    description: "Geopolitical Intelligence & Analysis",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-midnight-900 text-slate-light antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
