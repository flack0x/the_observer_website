# The Observer - Codebase Context

## Overview
Bilingual (EN/AR) geopolitical intelligence news platform. Aggregates content from Telegram channels via automated pipeline, displays with analytics dashboard. Includes admin dashboard for content management and book reviews section.

**Live Site**: https://al-muraqeb.com

## Deployment & Infrastructure

### Vercel
- **Project**: `the-observer-website`
- **Team**: `lineati-consultancy`
- **Plan**: Pro
- **Project ID**: `prj_vvFQWbJG5LkNE9Naswunx0X3JrK7`
- **CLI Version**: 50.1.3
- **CLI Auth**: `npx vercel login` (OAuth, stored in `~/.vercel/auth.json`)

### Supabase
- **Project**: `TheObserver`
- **Reference ID**: `gbqvivmfivsuvvdkoiuc`
- **Region**: South Asia (Mumbai) — `bom1`
- **Database**: PostgreSQL 17
- **CLI Version**: 2.76.8
- **Storage Bucket**: `article-media` (50MB limit, images/videos)
- **Auth**: Leaked password protection (HIBP) enabled

### Environment Variables (Vercel Production)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
```

## Tech Stack
- **Framework**: Next.js 16.1.1 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (`@theme` directive in `globals.css`)
- **Database**: Supabase (PostgreSQL 17)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Rich Text Editor**: TipTap (admin)
- **Telegram API**: Telethon (Python)
- **Auth**: Supabase Auth
- **Form Handling**: React Hook Form + Zod
- **Data Fetching**: SWR
- **Sanitization**: DOMPurify

## Data Pipeline

### Content Flow
```
Telegram Channels → fetch_telegram.py → AI Analysis → Supabase → Next.js API → Frontend
     ↓                    ↓                  ↓
@observer_5 (EN)    Groups multi-part    Extracts:
@almuraqb (AR)      posts (180s window)  - title, excerpt
                                         - category
                                         - countries[]
                                         - organizations[]
```

### Telegram Channels
- **English**: `@observer_5` → `channel = 'en'`
- **Arabic**: `@almuraqb` → `channel = 'ar'`

### Structured Post Formats

The fetcher recognizes multiple post formats:

**Format 1: Bold headers with values on next line**
```
🔴**Category**

Geopolitics | Cyber Warfare | Hybrid War

**Title**

**The Fall of the Starlink Myth: How Iran...**

**Countries Involved**

Iran 🇮🇷 | United States 🇺🇸
```

**Format 2: Inline title with colon**
```
🔴**Title : From Absurd to Armed: Trump's 2026 Plot...**

**Category**: Geopolitical
```

**Format 3: Legacy plain text (fallback)**
```
TITLE: Headline here
CATEGORY: Military | Political | Economic | Intelligence | Diplomatic | Breaking | Analysis
COUNTRIES: Israel, Yemen, Iran
ORGS: IDF, Houthis, Hamas
---
Article content...
```

**Valid Categories** (EN/AR):
- Military / عسكري
- Political / سياسي
- Economic / اقتصادي
- Intelligence / استخباراتي
- Diplomatic / دبلوماسي
- Breaking / عاجل
- Analysis / تحليل
- Geopolitics / جيوسياسي

### GitHub Actions
- **Workflow**: `.github/workflows/fetch-articles.yml`
- **Schedule**: Hourly cron (`0 * * * *`) + manual dispatch
- **Concurrency**: `telegram-fetch` group (prevents parallel runs)
- **Jobs**:
  1. `fetch_telegram.py` - Fetches new messages from Telegram
  2. `analyze_articles.py` - Computes metrics (NOTE: script not in repo, metrics may be stale)

- **Workflow**: `.github/workflows/fetch-headlines.yml`
- **Schedule**: Every 30 minutes (`*/30 * * * *`) + manual dispatch
- **Concurrency**: `headlines-fetch` group
- **Jobs**:
  1. `fetch_news_headlines.py` - Fetches headlines from 25+ international news RSS feeds

**fetch_telegram.py Features**:
- Incremental sync (tracks last synced message ID per channel)
- Groups consecutive messages within 180 seconds (multi-part articles)
- Combines multi-part posts into single articles
- Multi-format header parsing:
  - `**Title**` with value on next line (bold)
  - `**Title : Value**` or `**Title: Value` inline format (with/without closing `**`)
  - Strips emoji prefixes (🔴🔵🟢 etc.) before parsing
  - Legacy `TITLE: Value` format
- Extracts categories, countries, organizations
- Auto-detection fallback for unstructured posts
- Downloads and uploads images/videos to Supabase Storage
- Minimum message length: 20 chars (allows short headers in multi-part posts)
- Use `--full` flag to force complete re-sync

**Frontend Title Sanitization** (`src/lib/supabase.ts`):
- `sanitizeTitle()` strips `TITLE:` / `العنوان:` prefixes
- Handles pipe-separated fallback titles by extracting meaningful part

## File Structure

```
src/
├── app/
│   ├── [locale]/                    # Public pages (EN/AR)
│   │   ├── page.tsx                 # Home (Hero, LiveFeed, SituationPreview, Intel, Community)
│   │   ├── frontline/               # News listing
│   │   │   ├── page.tsx
│   │   │   └── [...slug]/           # Article detail
│   │   │       ├── page.tsx
│   │   │       └── ArticleContent.tsx
│   │   ├── books/                   # Library (Book Reviews)
│   │   │   ├── page.tsx             # Book listing grid
│   │   │   └── [...slug]/           # Book detail
│   │   │       ├── page.tsx
│   │   │       └── BookReviewContent.tsx
│   │   ├── voices/                  # External Voices (Authors/Analysts)
│   │   │   ├── page.tsx             # Voices listing
│   │   │   └── [...slug]/           # Voice detail
│   │   │       └── page.tsx
│   │   ├── situation-room/          # Analytics dashboard
│   │   ├── dossier/                 # Key figures (placeholder)
│   │   ├── chronicles/              # Timeline (placeholder)
│   │   ├── about/                   # Mission, Editorial Standards
│   │   ├── privacy/
│   │   ├── terms/
│   │   └── layout.tsx               # Locale layout + Header/Footer
│   │
│   ├── admin/                       # Admin Dashboard
│   │   ├── page.tsx                 # Dashboard home (stats, drafts, activity feed)
│   │   ├── layout.tsx               # Admin layout with sidebar
│   │   ├── AdminLayoutClient.tsx    # Client-side admin wrapper
│   │   ├── login/page.tsx           # Admin login
│   │   ├── signup/page.tsx          # Admin signup
│   │   ├── articles/                # Article management
│   │   │   ├── page.tsx             # List articles (bulk actions, quick edit)
│   │   │   ├── new/page.tsx         # Create article (media upload, publish)
│   │   │   └── [...id]/page.tsx     # Edit article (autosave, version history)
│   │   ├── books/                   # Book review management
│   │   │   ├── page.tsx             # List books
│   │   │   ├── new/page.tsx         # Create book review
│   │   │   └── [...id]/page.tsx     # Edit book review
│   │   ├── activity/page.tsx        # Activity log with filters
│   │   ├── calendar/page.tsx        # Content calendar (month grid)
│   │   ├── media/page.tsx           # Media library
│   │   ├── users/page.tsx           # User management
│   │   └── settings/page.tsx        # Site settings
│   │
│   ├── api/
│   │   ├── articles/route.ts        # GET public articles
│   │   ├── books/route.ts           # GET public book reviews
│   │   ├── metrics/route.ts         # GET aggregated metrics
│   │   ├── subscribe/route.ts       # POST newsletter signup
│   │   ├── og/route.tsx             # Dynamic OG images (Edge)
│   │   └── admin/
│   │       ├── articles/
│   │       │   ├── route.ts         # GET/POST admin articles
│   │       │   └── [...id]/route.ts # GET/PUT/DELETE single article
│   │       ├── article-revisions/
│   │       │   └── [...id]/route.ts # GET article version history
│   │       ├── books/
│   │       │   ├── route.ts         # GET/POST admin books
│   │       │   └── [...id]/route.ts # GET/PUT/DELETE single book
│   │       ├── activity/route.ts    # GET activity log
│   │       ├── media/route.ts       # GET/POST/DELETE media files
│   │       └── users/route.ts       # User management
│   │
│   ├── feed/
│   │   ├── route.ts                 # Redirect /feed → /feed/en
│   │   └── [lang]/route.ts          # RSS 2.0 XML feed (en/ar)
│   │
│   └── globals.css                  # Tailwind theme + utilities
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx               # Nav + language/theme toggle + mobile menu
│   │   └── Footer.tsx               # Newsletter form + links
│   ├── sections/
│   │   ├── HeroSection.tsx          # Dynamic stats
│   │   ├── LiveFeed.tsx             # Article cards
│   │   ├── SituationRoomPreview.tsx # Metrics preview
│   │   ├── IntelDashboard.tsx       # Charts
│   │   ├── FeaturedVoices.tsx       # External authors preview
│   │   └── Community.tsx            # Telegram CTAs
│   ├── admin/
│   │   ├── layout/
│   │   │   ├── AdminSidebar.tsx     # Admin navigation
│   │   │   └── AdminHeader.tsx      # Admin top bar
│   │   ├── editor/
│   │   │   ├── TipTapEditor.tsx     # Rich text editor
│   │   │   ├── EditorToolbar.tsx    # Editor toolbar
│   │   │   └── MediaPickerModal.tsx # Upload/browse media (image + video)
│   │   └── articles/
│   │       ├── ArticlePreviewModal.tsx
│   │       ├── ArticleComparisonModal.tsx  # EN/AR side-by-side diff
│   │       └── QuickEditModal.tsx   # Mobile-friendly quick editor
│   └── ui/
│       ├── BreakingNewsTicker.tsx
│       └── ThemeToggle.tsx
│
├── lib/
│   ├── slugify.ts                   # URL slug generation (generateSlug)
│   ├── supabase.ts                  # Supabase client + converters
│   ├── supabase/
│   │   └── server.ts                # Server-side Supabase client
│   ├── config.ts                    # Telegram channels, contact email
│   ├── categories.ts                # Category display names
│   ├── content.ts                   # Content normalization (ALL CAPS → sentence case)
│   ├── time.ts                      # Date formatting utilities
│   ├── hooks.ts                     # useArticles, useMetrics, useBreakingNews, useBookReviews
│   ├── voices.ts                    # External voices data and helpers
│   ├── rate-limit.ts                # Rate limiting
│   ├── admin/
│   │   ├── logActivity.ts           # Activity logging helper
│   │   └── types.ts                 # Admin type definitions
│   ├── theme/                       # Theme system
│   │   ├── index.ts                 # Exports useTheme
│   │   └── ThemeContext.tsx         # Theme provider
│   └── i18n/
│       ├── config.ts                # Locale types
│       ├── dictionaries.ts          # EN/AR translations
│       └── index.ts                 # Exports
│
├── middleware.ts                    # Locale detection
│
└── public/
    └── images/
        ├── observer-silhouette.png  # Logo
        └── books/                   # Book cover images
            ├── TenMythsAboutIsrael.png
            ├── DeepDive.jpg
            ├── TheHolocaustIndustry.jpg
            ├── IransMinistryofIntelligence.jpg
            ├── TheHundredYearsWaronPalestine.jpg
            ├── GrandDelusion.jpg
            └── PoliticalHistoryofModernIran.jpg
```

## Type Definitions & Interfaces

### Article (Frontend - `src/lib/hooks.ts`)
```typescript
interface Article {
  id: string;              // telegram_id (e.g., "observer_5/425")
  slug: string;            // SEO slug (e.g., "iran-nuclear-deal-analysis")
  title: string;
  excerpt: string;
  content: string;
  date: Date;              // Use getRelativeTime(date, locale) for display
  link: string;            // Telegram URL
  channel: "en" | "ar";
  category: string;        // Military, Political, Economic, etc.
  countries: string[];
  organizations: string[];
  isStructured: boolean;
  isBreaking: boolean;
  imageUrl: string | null;
  videoUrl: string | null;
  views: number;
  likes: number;
  dislikes: number;
}
```

### BookReview (Frontend - `src/lib/hooks.ts`)
```typescript
interface BookReview {
  id: string;              // review_id
  bookTitle: string;
  author: string;
  coverImageUrl: string | null;
  excerpt: string | null;
  description: string;     // HTML content
  keyPoints: string[];
  rating: number | null;   // 1-5
  recommendationLevel: 'essential' | 'recommended' | 'optional' | null;
  telegramLink: string | null;
  channel: 'en' | 'ar';
  createdAt: Date;
}
```

### Metrics (Frontend - `src/lib/hooks.ts`)
```typescript
interface Metrics {
  computed_at: string;
  total_articles: number;
  countries: Record<string, number>;      // { "Iran": 45, "Israel": 38, ... }
  organizations: Record<string, number>;  // { "IDF": 20, "Hamas": 15, ... }
  categories: Record<string, number>;
  temporal: {
    articles_today: number;
    articles_this_week: number;
    daily_trend: { date: string; count: number }[];
  };
  sentiment: {
    percentages: Record<string, number>;  // { negative: 60, neutral: 30, positive: 10 }
  };
  trending: { topic: string; mentions: number }[];
}
```

### Locale System (`src/lib/i18n/config.ts`)
```typescript
const locales = ['en', 'ar'] as const;
type Locale = 'en' | 'ar';
const defaultLocale: Locale = 'en';
const localeDirection: Record<Locale, 'ltr' | 'rtl'> = { en: 'ltr', ar: 'rtl' };
```

### Auth State (`src/lib/auth/context.tsx`)
```typescript
interface AuthState {
  user: User | null;           // Supabase User
  profile: UserProfile | null; // From user_profiles table
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

### Theme System (`src/lib/theme/ThemeContext.tsx`)
```typescript
type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}
// Storage key: 'theme' in localStorage
// Applied via: document.documentElement.setAttribute('data-theme', resolved)
```

## Client-Side Hooks (`src/lib/hooks.ts`)

```typescript
// Fetch articles with caching disabled
function useArticles(channel: "en" | "ar" | "all" = "en"): {
  articles: Article[];
  loading: boolean;
  error: string | null;
}

// Fetch metrics for dashboard
function useMetrics(): {
  metrics: Metrics | null;
  loading: boolean;
  error: string | null;
}

// Fetch book reviews
function useBookReviews(channel: 'en' | 'ar' = 'en'): {
  bookReviews: BookReview[];
  loading: boolean;
  error: string | null;
}
```

## Utility Functions

### Time (`src/lib/time.ts`)
```typescript
// "5 minutes ago", "منذ ٥ دقيقة"
function getRelativeTime(date: Date, locale: Locale): string;

// "January 15, 2026", "١٥ يناير ٢٠٢٦"
function formatDate(date: Date, locale: Locale): string;

// "14:30", "٢:٣٠"
function formatTime(date: Date, locale: Locale): string;
```

### Content (`src/lib/content.ts`)
```typescript
// Convert ALL CAPS text to sentence case (preserves acronyms)
function normalizeContent(content: string): string;

// Process single paragraph - converts ALL CAPS, preserves HTML tags
function processParagraph(paragraph: string): string;

// Convert text to sentence case (forceConvert skips isAllCaps check)
function convertAllCapsToSentenceCase(text: string, forceConvert?: boolean): string;

// Check if text is mostly ALL CAPS (>70% uppercase, min 10 letters)
function isAllCaps(text: string): boolean;

// Preserved acronyms: USA, UK, UN, EU, NATO, CIA, IDF, IRGC, PMF, etc.
```

### Categories (`src/lib/categories.ts`)
```typescript
const CATEGORIES = {
  ALL: 'All', BREAKING: 'Breaking', MILITARY: 'Military',
  POLITICAL: 'Political', ECONOMIC: 'Economic', INTELLIGENCE: 'Intelligence',
  DIPLOMATIC: 'Diplomatic', ANALYSIS: 'Analysis', GEOPOLITICS: 'Geopolitics',
};

// Get localized category name
function getCategoryDisplay(category: string, locale: 'en' | 'ar'): string;

// Get category list for filters
function getCategoryList(locale: 'en' | 'ar'): string[];

// Filter articles by category
function filterByCategory<T extends { category: string }>(
  articles: T[], selectedCategory: string, locale: 'en' | 'ar'
): T[];
```

### i18n (`src/lib/i18n/dictionaries.ts`)
```typescript
// Get full dictionary (synchronous)
function getDictionary(locale: Locale): Dictionary;

// Translate country name
function getCountryName(country: string, locale: Locale): string;

// Translate array of countries
function getCountryNames(countries: string[], locale: Locale): string[];
```

### Config (`src/lib/config.ts`)
```typescript
const TELEGRAM_CHANNELS = { en: 'https://t.me/observer_5', ar: 'https://t.me/almuraqb' };
const CONTACT_EMAIL = 'contact@theobserver.com';
function getTelegramChannel(locale: 'en' | 'ar'): string;
```

## Content Sanitization (`src/lib/supabase.ts`)

```typescript
// Strip corrupted characters, TITLE: prefix, pipe-separated metadata
function sanitizeTitle(title: string): string;

// Strip markdown, emojis, metadata from excerpts
function sanitizeExcerpt(excerpt: string): string;

// Convert DB article to frontend format (applies sanitization)
function dbArticleToFrontend(article: DBArticle): Article;
```

### Content Processing (`src/app/[locale]/frontline/[...slug]/ArticleContent.tsx`)

**Dual rendering path** — detects content type and applies appropriate processing:

```typescript
// Detection: admin-created articles have HTML from TipTap editor
const isHtmlContent = /<(?:p|h[2-3]|ul|ol|blockquote)\b/.test(article.content);
```

**HTML content (admin/TipTap)**: Skips `processContent()`, sanitizes with expanded DOMPurify tags:
- `ALLOWED_TAGS`: h2, h3, p, strong, em, a, ul, ol, li, blockquote, br, img, u
- `ALLOWED_ATTR`: href, target, rel, src, alt, class, dir
- Rendered with Tailwind prose styling (headings, lists, links, blockquotes)

**Telegram content**: Uses `processContent()` pipeline:
```typescript
function processContent(rawContent: string, title: string): string {
  // 1. Remove U+FFFD replacement characters
  // 2. Skip header section (title, category, countries)
  // 3. Remove emoji markers at start of lines
  // 4. Convert **bold** → <strong>, __italic__ → <em>
  // 5. Strip self-referential links: [Our website](https://al-muraqeb.com/...)
  // 6. Clean up multiple newlines
  // 7. Remove footer/channel references
}
// Sanitized with: ALLOWED_TAGS: ['strong', 'em', 'br']
```

## Supabase Clients

### Browser Client (`src/lib/supabase/client.ts`)
```typescript
import { getClient } from '@/lib/supabase/client';
const supabase = getClient();  // Singleton, use in client components

// Example: RPC call
await supabase.rpc('increment_view_count', { p_article_id: 123 });
await supabase.rpc('guest_vote', { p_article_id: 123, p_session_id: 'uuid', p_interaction_type: 'like' });
```

### Server Client (`src/lib/supabase/server.ts`)
```typescript
import { createClient, getUser, getUserProfile } from '@/lib/supabase/server';

// In Server Components or Route Handlers
const supabase = await createClient();
const user = await getUser();           // Returns User | null
const profile = await getUserProfile(); // Returns { ...user, profile } | null
```

## Middleware (`middleware.ts`)

**Locale Detection:**
1. Check if locale already in path → proceed
2. Detect from Accept-Language header
3. Redirect to `/{locale}{pathname}`

**Admin Auth:**
- `/admin/login`, `/admin/signup` → accessible without auth (redirect to `/admin` if logged in)
- `/admin/*` → require authenticated user
- `/admin/users` → require `role = 'admin'` in user_profiles

**Public Paths (no locale):** `/api/*`, `/_next/*`, `/images/*`, `/admin/*`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml`

## Rate Limiting (`src/lib/rate-limit.ts`)

```typescript
// Default: 100 req/min, Subscribe: 5 req/min
function rateLimit(identifier: string, config?: RateLimitConfig): {
  success: boolean;
  remaining: number;
  reset: number;
}

function getClientIdentifier(request: Request): string; // IP from headers
```

## Auth Context (`src/lib/auth/context.tsx`)

```typescript
import { useAuth } from '@/lib/auth/context';

const { user, profile, isAuthenticated, isLoading, signIn, signUp, signOut } = useAuth();

// Sign in
const { error } = await signIn('email@example.com', 'password');

// Sign up (creates profile via DB trigger)
const { error } = await signUp('email@example.com', 'password', 'Full Name');

// Sign out
await signOut();
```

## Guest Session Pattern

```typescript
// Get or create guest session ID (stored in localStorage)
const getGuestSessionId = () => {
  let sessionId = localStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
};

// Guest voting uses RPC functions (bypasses RLS)
await supabase.rpc('guest_vote', { p_article_id, p_session_id, p_interaction_type });
await supabase.rpc('guest_unvote', { p_article_id, p_session_id });

// Guest commenting uses RPC functions (bypasses RLS)
await supabase.rpc('guest_comment', { p_article_id, p_session_id, p_guest_name, p_content, p_parent_id });
await supabase.rpc('guest_delete_comment', { p_comment_id, p_session_id });

// Guest name persistence (stored separately from session ID)
localStorage.getItem('guest_comment_name');
localStorage.setItem('guest_comment_name', name);
```

## Component Patterns

### Page with Locale
```typescript
// src/app/[locale]/pagename/page.tsx
import { getDictionary, type Locale } from '@/lib/i18n';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);
  const isArabic = locale === 'ar';

  return <div dir={isArabic ? 'rtl' : 'ltr'}>...</div>;
}
```

### Client Component with Auth
```typescript
'use client';
import { useAuth } from '@/lib/auth/context';
import { getClient } from '@/lib/supabase/client';

export default function MyComponent({ locale }: { locale: string }) {
  const { user, isAuthenticated } = useAuth();
  const supabase = getClient();

  // Redirect to login if needed
  if (!isAuthenticated) {
    router.push(`/${locale}/login`);
    return;
  }
}
```

### API Route
```typescript
// src/app/api/example/route.ts
import { NextResponse } from "next/server";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic'; // Disable caching

export async function GET(request: Request) {
  const clientId = getClientIdentifier(request);
  const { success } = rateLimit(`example:${clientId}`);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  // ... fetch data
  return NextResponse.json(data);
}
```

## Dictionary Structure (`src/lib/i18n/dictionaries.ts`)

```typescript
dict.nav           // { frontline, situationRoom, books, voices, dossier, chronicles, about }
dict.header        // { title, subtitle, live }
dict.common        // { readMore, viewAll, share, loading, ... }
dict.home          // { heroTitle, heroSubtitle, liveFeed, ... }
dict.frontline     // { title, subtitle, backToFrontline, filter, ... }
dict.article       // { copied, stayInformed, joinObserver }
dict.books         // { title, rating, author, keyPoints, essential, ... }
dict.voices        // { title, subtitle, featuredVoices, viewProfile, credentials, ... }
dict.dashboard     // { totalArticles, thisWeek, countries, ... }
dict.footer        // { about, privacy, subscribe, ... }
dict.countries     // { Russia: "Russia"/"روسيا", Iran: "Iran"/"إيران", ... }
dict.about         // { title, missionTitle, principlesTitle, ... }
dict.community     // { joinNetwork, telegramEnglish, ... }
```

## External Voices System (`src/lib/voices.ts`)

Static data system for featuring external authors and analysts.

### ExternalVoice Interface
```typescript
interface ExternalVoice {
  slug: string;                    // URL slug: "j-michael-springmann"
  name: string;                    // Display name
  nameAr?: string;                 // Arabic name
  title: string;                   // "Former US Diplomat & Author"
  titleAr?: string;                // Arabic title
  avatar: string;                  // Image URL
  bio: string;                     // Full biography
  bioAr?: string;                  // Arabic biography
  credentials: string[];           // List of credentials
  credentialsAr?: string[];        // Arabic credentials
  links: {
    substack?: string;
    twitter?: string;
    website?: string;
    amazon?: string;
  };
  featuredArticles: { title: string; url: string; description?: string }[];
  books?: { title: string; url?: string; coverImage?: string }[];
}
```

### Helper Functions
```typescript
getAllVoices(): ExternalVoice[]              // Get all voices
getVoiceBySlug(slug: string): ExternalVoice  // Get single voice
getFeaturedVoices(limit: number): ExternalVoice[]  // Get first N voices for homepage
```

### Current Voices
- **J. Michael Springmann** (`j-michael-springmann`) - Former US diplomat, author of "Visas for Al Qaeda"

### Adding a New Voice
1. Add entry to `EXTERNAL_VOICES` array in `src/lib/voices.ts`
2. Include: slug, name, nameAr, title, titleAr, avatar, bio, bioAr, credentials, links, featuredArticles, books
3. Pages auto-generate via `generateStaticParams()`

## Database Schema (Supabase)

### Migrations (`supabase/migrations/`)
| Migration | Description |
|-----------|-------------|
| `20260102111902_create_articles_table.sql` | Initial articles table + RLS |
| `20260102190000_create_metrics_table.sql` | Metrics table for analytics |
| `20260103100000_add_structured_fields.sql` | countries[], organizations[], is_structured |
| `20260103110000_add_subscribers_table.sql` | Newsletter subscribers |
| `20260108050207_add_media_fields.sql` | image_url, video_url fields |
| `20260108050320_create_article_media_bucket.sql` | Storage bucket for media |
| `20260109120000_admin_system.sql` | user_profiles, roles |
| `20260109130000_fix_rls_recursion.sql` | RLS policy fixes |
| `20260109140000_fix_security_issues.sql` | Security hardening |
| `20260110120000_fix_rls_performance.sql` | RLS performance optimization |
| `20260113120000_create_book_reviews_table.sql` | Book reviews table |
| `20260117120000_create_news_headlines_table.sql` | External news headlines |
| `20260121120000_add_interactions.sql` | Likes, dislikes, shares |
| `20260121130000_add_bookmarks.sql` | User bookmarks system |
| `20260121140000_add_views_and_guest_votes.sql` | View counters + guest support |
| `20260121150000_fix_guest_policy.sql` | Guest interactions RLS fix |
| `20260121160000_fix_vote_trigger.sql` | Vote trigger handles UPDATE |
| `20260127120000_secure_guest_voting.sql` | RPC functions for guest voting |
| `20260128120000_create_comments_table.sql` | Article comments with threading |
| `20260128120000_allow_guest_comments.sql` | Guest commenting: nullable user_id, guest_name, session_id |
| `20260128130000_allow_guest_comments.sql` | Guest comment RPC functions (guest_comment, guest_delete_comment) |
| `20260203120000_create_activity_log.sql` | Activity log table for admin actions |
| `20260203130000_add_scheduled_at.sql` | Scheduled publishing field on articles |
| `20260205120000_add_article_slugs.sql` | Add slug column to articles |
| `20260205130000_enforce_article_slugs.sql` | NOT NULL + unique index on slug per channel |
| `20260205140000_add_fulltext_search.sql` | tsvector column + GIN index + trigger for full-text search |
| `20260215120000_fix_security_warnings.sql` | Fix function search_path + restrict RLS policies |
| `20260215130000_fix_rls_performance.sql` | Fix RLS initplan + merge duplicate policies + drop unused indexes |

### articles
| Column | Type | Notes |
|--------|------|-------|
| id | serial | Auto-increment PK |
| telegram_id | text | Unique (e.g., "observer_5/336") |
| slug | text | SEO URL slug, NOT NULL, unique per channel |
| channel | text | 'en' or 'ar' |
| title | text | Extracted/generated |
| excerpt | text | First ~200 chars |
| content | text | Full article body |
| category | text | Military, Political, Economic, etc. |
| countries | text[] | Extracted country names |
| organizations | text[] | Extracted org names |
| is_structured | boolean | Has clear structure |
| image_url | text | Article image |
| video_url | text | Article video |
| telegram_link | text | Original Telegram URL |
| telegram_date | timestamptz | Original post date |
| status | text | 'draft', 'published', 'archived' |
| published_at | timestamptz | Publication date |
| author_id | uuid | FK to auth.users |
| last_edited_by | uuid | FK to auth.users |
| views | integer | Total view count (0 default) |
| likes_count | integer | Total likes (cached) |
| dislikes_count | integer | Total dislikes (cached) |
| comment_count | integer | Total comments (cached via trigger) |
| search_vector | tsvector | Full-text search (weighted: A=title, B=excerpt, C=content) |
| created_at | timestamptz | DB insert time |
| updated_at | timestamptz | Last update time |

### article_interactions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| article_id | bigint | FK to articles |
| user_id | uuid | FK to auth.users (nullable) |
| session_id | text | Guest session UUID (nullable) |
| interaction_type | text | 'like' or 'dislike' |
| created_at | timestamptz | |

### bookmarks
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| article_id | bigint | FK to articles |
| created_at | timestamptz | |

### article_shares
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| article_id | bigint | FK to articles |
| user_id | uuid | FK to auth.users |
| platform | text | e.g., 'copy_link' |
| created_at | timestamptz | |

### article_comments
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| article_id | bigint | FK to articles |
| user_id | uuid | FK to auth.users (nullable for guests) |
| parent_id | uuid | FK to article_comments (nullable, for replies) |
| guest_name | text | Display name for guest commenters |
| session_id | text | Guest session UUID for ownership verification |
| content | text | 3-2000 characters |
| is_approved | boolean | For moderation (default true) |
| is_edited | boolean | Auto-set on update |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Constraint**: `comment_author_check` — every comment must have either `user_id` (authenticated) OR both `guest_name` AND `session_id` (guest).

### book_reviews
| Column | Type | Notes |
|--------|------|-------|
| id | serial | Auto-increment PK |
| review_id | text | Unique (e.g., "book/123-title-en") |
| channel | text | 'en' or 'ar' |
| book_title | text | Book title |
| author | text | Book author |
| cover_image_url | text | Cover image path |
| excerpt | text | Short summary |
| description | text | Full review (HTML) |
| key_points | text[] | Array of key points |
| rating | integer | 1-5 stars |
| recommendation_level | text | 'essential', 'recommended', 'optional' |
| telegram_link | text | Link to Telegram post |
| status | text | 'draft', 'published', 'archived' |
| published_at | timestamptz | Publication date |
| author_id | uuid | FK to auth.users |
| last_edited_by | uuid | FK to auth.users |
| created_at | timestamptz | DB insert time |
| updated_at | timestamptz | Last update time |

### news_headlines
| Column | Type | Notes |
|--------|------|-------|
| id | serial | Auto-increment PK |
| headline_id | text | Unique (MD5 hash of source+title) |
| source_name | text | News source name (e.g., "BBC World") |
| source_country | text | Country of origin |
| title | text | Headline text |
| url | text | Link to full article |
| category | text | 'World', 'Middle East', 'Asia', etc. |
| language | text | 'en', 'ar', 'other' |
| published_at | timestamptz | Original publish time |
| fetched_at | timestamptz | When we fetched it |
| is_active | boolean | Whether to display |
| created_at | timestamptz | DB insert time |

### subscribers
| Column | Type |
|--------|------|
| email | text (unique) |
| locale | text |
| is_active | boolean |
| subscribed_at | timestamptz |

### user_profiles
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, FK to auth.users |
| email | text | User email |
| full_name | text | Display name |
| avatar_url | text | Profile image |
| role | text | 'admin', 'editor', 'viewer' |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### metrics
| Column | Type | Notes |
|--------|------|-------|
| id | serial | PK |
| metric_type | varchar(50) | 'daily_snapshot', 'country_mentions', etc. |
| data | jsonb | Computed metrics |
| computed_at | timestamptz | When metrics were computed |

### RPC Functions

All RPC and trigger functions use `SECURITY DEFINER` + `SET search_path = public` (fixed in migration `20260215120000`).

**`increment_view_count(p_article_id BIGINT)`**
- Atomically increments article view count
- Called from article detail pages

**`guest_vote(p_article_id BIGINT, p_session_id TEXT, p_interaction_type TEXT)`**
- Adds or changes a guest vote (like/dislike)
- Deletes existing vote first, then inserts new one

**`guest_unvote(p_article_id BIGINT, p_session_id TEXT)`**
- Removes a guest vote

**`guest_comment(p_article_id BIGINT, p_session_id TEXT, p_guest_name TEXT, p_content TEXT, p_parent_id UUID DEFAULT NULL)`**
- Creates a comment as a guest user
- Validates content (3-2000 chars) and name (1-50 chars)
- Returns UUID of created comment

**`guest_delete_comment(p_comment_id UUID, p_session_id TEXT)`**
- Deletes a guest comment by verifying session ownership
- Only deletes if `session_id` matches AND `user_id IS NULL`
- Returns boolean success indicator

## Middleware (`middleware.ts`)

**Features**:
- Locale detection from URL path
- Accept-Language header detection for auto-redirect
- Admin route authentication via Supabase Auth
- Role-based access control (admin-only for `/admin/users`)

**Public Paths** (no locale prefix):
- `/api/*`, `/_next/*`, `/images/*`, `/admin/*`
- `/favicon.ico`, `/robots.txt`, `/sitemap.xml`, `/manifest.json`

**Auth Flow**:
1. `/admin/login`, `/admin/signup` - accessible without auth
2. All other `/admin/*` routes require authenticated user
3. `/admin/users` requires `role = 'admin'` in user_profiles

## i18n Architecture

```
src/lib/i18n/
├── config.ts       # Locale types, locales array, directions
├── dictionaries.ts # All EN/AR translations + country names
└── index.ts        # Exports (getDictionary, getCountryName, etc.)
```

- **Locale route**: `[locale]` dynamic segment (`/en/...`, `/ar/...`)
- **Dictionary access**: `getDictionary(locale)` - synchronous
- **Country names**: `getCountryName(country, locale)` - translates country names
- **RTL**: `dir={isArabic ? 'rtl' : 'ltr'}` on section containers
- **Arabic font**: Noto Sans Arabic (configured in `layout.tsx`)

### Key Dictionary Sections
```typescript
dict.nav       // Navigation items
dict.header    // Header title/subtitle
dict.hero      // Hero section
dict.liveFeed  // Live feed section
dict.article   // Article page
dict.books     // Library/Book reviews
dict.about     // About page
dict.footer    // Footer
dict.countries // Country name translations
```

## Theme System

Located in `src/lib/theme/`:
- **ThemeContext.tsx**: React context provider
- **index.ts**: Exports `useTheme()` hook

```typescript
const { theme, resolvedTheme, toggleTheme } = useTheme();
// theme: 'light' | 'dark' | 'system'
// resolvedTheme: 'light' | 'dark' (actual applied theme)
```

Theme toggle in Header (desktop + mobile).

## Tailwind v4 Constraints

- **No dynamic classes**: `bg-${color}` won't work
- **Theme in CSS**: Colors defined in `globals.css` under `@theme`
- **Custom utilities**: `scrollbar-hide`, focus-visible styles

### Color Tokens (WCAG Compliant)
```css
--color-tactical-red: #dc2626      /* Primary accent, CTAs */
--color-tactical-amber: #d97706    /* Secondary accent */
--color-earth-olive: #84cc16       /* Success/positive */
--color-midnight-900: #0a0f14      /* Darkest background */
--color-midnight-800: #111920      /* Card backgrounds */
--color-midnight-700: #1a2332      /* Borders */
--color-slate-light: #f1f5f9       /* Primary text */
--color-slate-medium: #94a3b8      /* Secondary text */
--color-slate-dark: #64748b        /* Muted text */
```

## API Routes

All API route files export `preferredRegion = 'bom1'` to co-locate serverless functions with the Supabase database in Mumbai, reducing latency.

### Public APIs

**GET /api/articles**
- Query: `channel` ('en' | 'ar' | 'all'), `limit`, `search` (full-text, min 2 chars)
- Without `search`: Returns all articles (paginated)
- With `search`: Returns full-text search results (max 50) using tsvector + GIN index
- Returns: `Article[]`

**GET /api/books**
- Query: `channel` ('en' | 'ar'), `limit`
- Returns: `BookReview[]`

**GET /api/metrics**
- Returns: Aggregated stats (counts, trends, etc.)

**GET /api/headlines**
- Query: `language` ('en' | 'ar'), `limit`, `format` ('full' | 'ticker')
- Returns: `NewsHeadline[]` or `string[]` (ticker format)

**GET /feed/en** and **GET /feed/ar**
- Returns: RSS 2.0 XML with latest 50 articles
- `Cache-Control: public, max-age=900` (15 min)
- `/feed` redirects to `/feed/en`

**POST /api/subscribe**
- Body: `{ email, locale? }`
- Rate limited: 5 req/min

### Admin APIs (Auth Required)

**GET/POST /api/admin/articles**
**GET/PUT/DELETE /api/admin/articles/[...id]**

**GET/POST /api/admin/books**
**GET/PUT/DELETE /api/admin/books/[...id]**

## Hooks

```typescript
// src/lib/hooks.ts
useArticles(channel: 'en' | 'ar' | 'all')  // Uses fetchWithRetry (2 retries, 200/500ms backoff)
useMetrics()                                 // Uses fetchWithRetry
useBreakingNews(locale)
useBookReviews(channel: 'en' | 'ar')
```

## Navigation Items

Desktop nav (in order):
1. Frontline (`/[locale]/frontline`)
2. Situation Room (`/[locale]/situation-room`)
3. Library (`/[locale]/books`)
4. Voices (`/[locale]/voices`)
5. Dossier (`/[locale]/dossier`)
6. Chronicles (`/[locale]/chronicles`)
7. About (`/[locale]/about`)

Admin sidebar:
1. Dashboard (`/admin`)
2. Articles (`/admin/articles`)
3. Books (`/admin/books`)
4. Calendar (`/admin/calendar`)
5. Activity (`/admin/activity`)
6. Media (`/admin/media`)
7. Users (`/admin/users`)
8. Settings (`/admin/settings`)

## Image Configuration

External domains in `next.config.ts`:
- images.unsplash.com
- gbqvivmfivsuvvdkoiuc.supabase.co (Supabase storage)
- images-na.ssl-images-amazon.com
- m.media-amazon.com
- media.wiley.com

Local images: `public/images/books/`

## Common Tasks

### Add new i18n string
1. Add to `dictionaries.ts` under both `en` and `ar` objects
2. Access via `dict.section.key`

### Add new page
1. Create `src/app/[locale]/pagename/page.tsx`
2. Use `generateStaticParams()` for static generation
3. Get dict: `const dict = getDictionary(locale as Locale)`

### Add new admin page
1. Create `src/app/admin/pagename/page.tsx`
2. Add nav item to `AdminSidebar.tsx`
3. Create API route if needed in `src/app/api/admin/`

### Add book review
1. Go to admin dashboard (`/admin/books/new`)
2. Create EN version, then AR version
3. Both use same `review_id` pattern

### Trigger article refresh
```bash
gh workflow run "Fetch Telegram Articles & Analyze"
```

## CLI Commands

### Supabase
```bash
npx supabase projects list          # List linked projects
npx supabase db push                # Push migrations to remote
npx supabase db diff                # Generate migration from changes
npx supabase migration list         # List migrations
npx supabase gen types typescript   # Generate TypeScript types
npx supabase start                  # Start local Supabase
npx supabase stop                   # Stop local Supabase
```

### Vercel
```bash
npx vercel                          # Deploy preview
npx vercel --prod                   # Deploy to production
npx vercel env ls                   # List environment variables
npx vercel logs                     # View deployment logs
npx vercel inspect <deployment>     # Inspect deployment
```

### GitHub Actions
```bash
gh workflow list                    # List workflows
gh workflow run <workflow>          # Trigger workflow
gh run list                         # List recent runs
gh run view <run-id>                # View run details
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # For admin operations
OPENAI_API_KEY=              # For fetch_telegram.py
TELEGRAM_API_ID=             # For fetch_telegram.py
TELEGRAM_API_HASH=           # For fetch_telegram.py
```

## NPM Scripts

```bash
npm run dev      # Development server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint

# E2E Testing (Playwright)
npm run test:api      # API tests only (fast, 100% pass rate)
npm run test:admin    # Admin tests (requires .env.test credentials)
npm run test:public   # Public page tests (against production)
npm run test:ui       # Visual debugging mode
npx playwright test   # Run all tests
```

## Scripts (`scripts/`)

| Script | Purpose |
|--------|---------|
| `fetch_telegram.py` | Main article fetcher (Telegram → Supabase) |
| `fetch_news_headlines.py` | Fetch headlines from RSS feeds |
| `publish_article.py` | Publish draft articles |
| `upload_image.py` | Upload image to Supabase Storage |
| `create_admin_user.js` | Create admin user in Supabase |
| `backfill_slugs.js` | Backfill SEO slugs for existing articles |
| `schema.sql` | Database schema reference |

**Python Dependencies** (`scripts/requirements.txt`):
```
telethon
python-dotenv
supabase
feedparser
requests
```

## E2E Testing (Playwright)

Located in `tests/` directory with Playwright configuration in `playwright.config.ts`.

### Test Structure
```
tests/
├── api/                    # API endpoint tests
│   ├── articles.spec.ts    # /api/articles (filters, search, pagination)
│   ├── books.spec.ts       # /api/books endpoint
│   ├── metrics.spec.ts     # /api/metrics endpoint
│   ├── headlines.spec.ts   # /api/headlines endpoint
│   ├── subscribe.spec.ts   # /api/subscribe validation
│   ├── rss.spec.ts         # RSS feed XML validation
│   └── health-check.spec.ts # Quick API health verification
├── admin/                  # Admin dashboard tests
│   ├── login.spec.ts       # Login page, validation, redirects
│   └── article-create.spec.ts  # Article creation, editor, media picker
├── public/                 # Public page tests
│   ├── homepage.spec.ts    # Homepage sections, SEO
│   ├── navigation.spec.ts  # Nav links, language switching
│   ├── frontline.spec.ts   # Article listing, search, filters
│   ├── article-detail.spec.ts  # Article page content, images, interactions
│   ├── mobile.spec.ts      # Mobile navigation, layout, touch targets
│   ├── search-filters.spec.ts  # Search and filter functionality
│   └── interactions.spec.ts    # Like/dislike, comments, share UI (read-only)
├── seo/                    # SEO validation tests
│   ├── sitemap.spec.ts     # Sitemap URLs, robots.txt
│   └── meta-tags.spec.ts   # OG tags, hreflang, canonical URLs
└── setup/
    └── auth.setup.ts       # Admin authentication setup
```

### Configuration
- **Base URL**: `https://al-muraqeb.com` (production)
- **Browser**: Chromium (primary), optionally Firefox/Safari
- **Timeout**: 30s for tests, 60s for navigation
- **Retries**: 1 retry on failure
- **Workers**: 4 parallel workers
- **Auth State**: Stored in `playwright/.auth/admin.json`

### Test Credentials
Stored in `.env.test` (gitignored):
```
TEST_ADMIN_EMAIL=your-admin@example.com
TEST_ADMIN_PASSWORD=your-password
```

### Running Tests
```bash
npx playwright test                           # All tests
npx playwright test tests/api                 # API tests only
npx playwright test tests/admin --project=chromium  # Admin tests
npx playwright test --ui                      # Visual debugging
npx playwright test --headed                  # Watch browser
```

### What's Tested
- **API**: All endpoints, response shapes, error handling
- **Admin**: Login flow, article creation, editor, media picker
- **Public**: Homepage, article detail, mobile layout, search/filters
- **SEO**: Sitemap, meta tags, OG tags, hreflang

All tests are **read-only** — safe to run against production.

## Git Conventions

Commit format:
```
Short description

- Bullet points of changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## Key Dependencies (package.json)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | React framework |
| react | 19.2.3 | UI library |
| tailwindcss | 4.1.18 | CSS framework |
| @supabase/supabase-js | 2.89.0 | Database client |
| @supabase/ssr | 0.8.0 | Server-side auth |
| framer-motion | 12.23.26 | Animations |
| recharts | 3.6.0 | Charts |
| @tiptap/react | 3.15.3 | Rich text editor |
| swr | 2.3.8 | Data fetching |
| zod | 4.3.5 | Schema validation |
| dompurify | 3.3.1 | HTML sanitization |

## Local Development

### Running the site
```bash
npm run dev                    # Start Next.js dev server (port 3000)
```

### Running Telegram sync manually
```bash
cd scripts
python fetch_telegram.py              # Incremental sync (new messages only)
python fetch_telegram.py --full       # Full sync (re-process all)
python fetch_telegram.py --channel en # Sync only English channel
python fetch_telegram.py --channel ar # Sync only Arabic channel
```

### Viewing raw data (debugging)
```python
# Quick inline query to check articles
python -c "
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
import os

load_dotenv(Path('.env.local'))
supabase = create_client(os.getenv('NEXT_PUBLIC_SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))
result = supabase.table('articles').select('telegram_id, title').eq('channel', 'en').order('telegram_date', desc=True).limit(5).execute()
for r in result.data:
    print(f\"{r['telegram_id']}: {r['title'][:50]}\")
"
```

## Troubleshooting

### Article titles showing wrong content
**Symptoms**: Titles like "Geopolitics | Cyber Warfare | HYBRID WAR..." or "TITLE: Something"

**Causes**:
1. New post format not recognized by parser
2. Emoji prefix blocking regex match
3. Missing closing `**` in title format

**Fix**:
1. Check raw content format in Telegram or database
2. Update `parse_structured_header()` in `scripts/fetch_telegram.py`
3. Run full sync: `python scripts/fetch_telegram.py --full`

### Multi-part articles not grouped
**Symptoms**: Article starts with "2." or "3." (missing first part)

**Causes**:
1. First message too short (< 20 chars) → filtered out
2. Time gap > 180 seconds between parts

**Fix**:
1. Lower `MIN_MESSAGE_LENGTH` if needed
2. Check message timestamps in Telegram

### Articles showing 0 / "No articles found"
**Symptoms**: Stats show 0, Live Feed says "No articles found", but database has data

**Causes**:
1. Cross-region latency: Vercel functions default to US East, Supabase is in Mumbai
2. Silent fetch failures in client-side hooks (errors caught but not surfaced)

**Fix**:
1. Ensure all API routes have `export const preferredRegion = 'bom1';`
2. Ensure `vercel.json` has `"regions": ["bom1"]`
3. Check browser console for fetch errors (hooks now log with console.error)
4. Redeploy: `npx vercel --prod`

### Changes not showing on website
**Causes**:
1. Browser cache → Hard refresh (Ctrl+F5)
2. Vercel edge cache → Redeploy or wait
3. Database not updated → Run sync again

### Telegram session expired
**Fix**: Re-authenticate via Telethon. For CI/CD, set `TELEGRAM_SESSION_STRING` environment variable.

### Article content showing raw markdown or wall of text
**Symptoms**: `**text**` or `__text__` visible, or HTML tags stripped (no headings/lists)

**Location**: `src/app/[locale]/frontline/[...slug]/ArticleContent.tsx`

**Fix**: Content uses dual rendering path:
- **Telegram content**: `processContent()` converts markdown to HTML (limited tags)
- **Admin/TipTap content**: Detected by `/<(?:p|h[2-3]|ul|ol|blockquote)\b/`, uses expanded DOMPurify tags
1. Check raw content in database to determine source (HTML tags = admin, markdown = Telegram)
2. For Telegram: update regex patterns in `processContent()`
3. For admin: update DOMPurify ALLOWED_TAGS if new elements needed
4. Rebuild and deploy

### Excerpts showing metadata or markdown
**Location**: `src/lib/supabase.ts` → `sanitizeExcerpt()`

**Fix**: Update the sanitization patterns to handle new formats

## Footer Structure

4-column layout (Brand | Navigate | Legal | Connect):
- **Brand**: Logo, description, "Secure & Independent" badge
- **Navigate**: Links synced with Header (Frontline, Situation Room, Library, Dossier, Chronicles, About)
- **Legal**: Privacy, Terms
- **Connect**: Telegram EN/AR links
- **Newsletter**: Email subscription form in top section

## Database Stats (Feb 15, 2026)

| Table | Count | Notes |
|-------|-------|-------|
| Articles (total) | 729 | EN + AR combined, 727 published, 2 draft |
| Book Reviews | 14 | 7 EN, 7 AR published |
| News Headlines | 200+ | Active from RSS feeds |
| Activity Log | Active | Tracks admin actions |
| User Profiles | 1 | Admin configured |

## Recent Changes (Feb 2026)

- **Security & Reliability Fixes** (Feb 15):
  - Added `preferredRegion = 'bom1'` to all 15 API route files + `regions: ["bom1"]` in vercel.json
    (co-locates Vercel functions with Supabase Mumbai, fixes intermittent article loading failures)
  - Added `fetchWithRetry` helper in hooks.ts (2 retries, 200/500ms backoff) for resilience
  - Added array type check and console.error logging in useArticles/useMetrics hooks
  - Security migration `20260215120000_fix_security_warnings.sql`:
    - Fixed 10 functions with `SECURITY DEFINER` + `SET search_path = public`
    - Restricted `book_reviews` INSERT/UPDATE to admin/editor, DELETE to admin only
    - Added `article_id`/`platform` NOT NULL validation on `article_shares` INSERT
    - Added email regex validation on `subscribers` INSERT
  - Enabled leaked password protection (HIBP) via Supabase Auth config
  - Added `status: 'published'` to fetch_telegram.py (both parse_message and combine_message_group)
  - Performance migration `20260215130000_fix_rls_performance.sql`:
    - Wrapped `auth.uid()`/`auth.role()` in `(select ...)` across 16 RLS policies (per-statement eval)
    - Merged duplicate permissive policies on `article_comments`, `book_reviews`
    - Dropped redundant `service_role` policies on `news_headlines`, `activity_log`
    - Added FK indexes on `article_shares.user_id`, `book_reviews.author_id/last_edited_by`
    - Dropped 19 unused indexes (kept GIN search indexes)

- **Admin Delete + Content Rendering Fix** (Feb 8):
  - Removed `ShowForAdmin` wrappers from delete buttons in admin articles page
    (redundant since admin dashboard is already behind auth; API has server-side check)
  - Added dual rendering path in ArticleContent: TipTap HTML vs Telegram markdown
  - Admin-created articles now render with proper headings, lists, links, blockquotes

- **Admin Panel Mobile Responsiveness** (Feb 7):
  - Admin panel now uses same Header as main site (including news ticker)
  - Breaking news fetched server-side in admin layout for instant display
  - Removed JOIN INTEL button from header (desktop and mobile)
  - Added prominent "Admin Panel" button in mobile menu for admin users
  - Mobile-responsive dashboard: 2-column stat cards, FAB for sidebar access
  - Overflow fixes to prevent horizontal scrolling on mobile

- **Playwright E2E Test Suite** (Feb 6):
  - 210+ tests covering API, admin, public pages, SEO (87% pass rate)
  - NPM scripts: `test:api`, `test:admin`, `test:public`, `test:ui`
  - All tests read-only — safe against production

- **RSS Feeds** (Feb 5):
  - `/feed/en` and `/feed/ar` serve RSS 2.0 XML (50 articles, 15-min cache)
  - Route: `src/app/feed/[lang]/route.ts`

- **Full-Text Search** (Feb 5):
  - PostgreSQL tsvector + GIN index for fast article search
  - `/api/articles?search=...` with debounced 300ms frontend

- **Core Web Vitals** (Feb 5):
  - `next/font` for self-hosted fonts, dynamic imports for heavy components
  - GA changed to `lazyOnload`, preconnect for Supabase CDN

- **SEO Slugs** (Feb 5):
  - Descriptive URLs (`/iran-nuclear-deal-analysis` vs `/observer_5/447`)
  - Old URLs auto-redirect (307)

- **Admin Features** (Feb 2-4):
  - Autosave, quick publish, media picker, duplicate for translation
  - Bulk actions, content calendar, version history, activity log
  - Mobile quick-edit modal, EN/AR comparison modal

## Recent Changes (Jan 2026)

- **Comments System** (Jan 28-29): Full commenting with guest support
  - Threading via `parent_id`, guest comments via `session_id`
  - RPC functions: `guest_comment`, `guest_delete_comment`

- **External Voices** (Jan 28): `/[locale]/voices` for external authors
  - Static data in `src/lib/voices.ts`, first voice: J. Michael Springmann

- **Guest Voting** (Jan 27): RPC functions fix for session-based voting
  - `guest_vote`, `guest_unvote` with `SECURITY DEFINER`

- **User System** (Jan 21): Auth, dashboard, bookmarks, interactions
  - Like/dislike, view counters, profile dropdown

- **Content Fixes** (Jan 15): Telegram markdown → HTML, title parsing
  - Emoji stripping, self-referential link removal

- **Library** (Jan): Book reviews with ratings, admin CRUD

- **SEO Overhaul** (Jan 17): Domain change to al-muraqeb.com
  - Hreflang, canonical URLs, sitemap, Google Search Console

- **News Headlines** (Jan 17): 25+ RSS feeds for breaking ticker

## Google Search Console

- **Property**: al-muraqeb.com (Domain property, DNS TXT verified)
- **Sitemap**: https://al-muraqeb.com/sitemap.xml (380+ pages)
- **Verification Code**: `6GZxTpIryls2s95Zkl3jkPxpPsYlvW3LGnEe4L6Qm2k`
- **SEO**: robots.txt OK, canonical URLs, JSON-LD, hreflang, descriptive slugs
