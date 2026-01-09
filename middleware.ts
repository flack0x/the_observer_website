import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { locales, defaultLocale, type Locale } from '@/lib/i18n/config';

// Paths that should not be localized
const publicPaths = [
  '/api',
  '/_next',
  '/images',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/admin', // Admin routes handle their own routing
];

// Type guard to check if a string is a valid locale
function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  return isValidLocale(potentialLocale) ? potentialLocale : null;
}

// Create Supabase client for middleware
function createMiddlewareSupabaseClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return { supabase, response };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle admin routes separately
  if (pathname.startsWith('/admin')) {
    return handleAdminRoute(request);
  }

  // Skip other public paths
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
      .find(lang => isValidLocale(lang));

    if (preferredLocale) {
      detectedLocale = preferredLocale;
    }
  }

  // Redirect to the localized path
  const url = request.nextUrl.clone();
  url.pathname = `/${detectedLocale}${pathname}`;

  return NextResponse.redirect(url);
}

// Handle admin route authentication
async function handleAdminRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login and signup pages without auth
  if (pathname === '/admin/login' || pathname === '/admin/signup') {
    // If already logged in, redirect to dashboard
    const { supabase, response } = createMiddlewareSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    return response;
  }

  // For all other admin routes, check authentication
  const { supabase, response } = createMiddlewareSupabaseClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Not authenticated, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // Check role for users page (admin only)
  if (pathname.startsWith('/admin/users')) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      // Not admin, redirect to dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Match all paths except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
};
