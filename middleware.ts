import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '@/lib/i18n/config';

// Paths that should not be localized
const publicPaths = [
  '/api',
  '/_next',
  '/images',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
];

function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  return locales.includes(potentialLocale as any) ? potentialLocale : null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if locale is already in the path
  const pathnameLocale = getLocaleFromPath(pathname);

  if (pathnameLocale) {
    // Locale is in the path, proceed
    return NextResponse.next();
  }

  // No locale in path - redirect to default locale
  // Try to detect preferred language from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  let detectedLocale = defaultLocale;

  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().split('-')[0])
      .find(lang => locales.includes(lang as any));

    if (preferredLocale) {
      detectedLocale = preferredLocale as typeof defaultLocale;
    }
  }

  // Redirect to the localized path
  const url = request.nextUrl.clone();
  url.pathname = `/${detectedLocale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  // Match all paths except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
};
