import { Metadata } from 'next';
import Script from 'next/script';
import '../globals.css';
import AdminLayoutClient from './AdminLayoutClient';
import { ThemeProvider } from '@/lib/theme';

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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <body className="min-h-screen bg-midnight-900 text-slate-light antialiased">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0Z0P2B5QT8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0Z0P2B5QT8');
          `}
        </Script>
        <ThemeProvider>
          <AdminLayoutClient>{children}</AdminLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
