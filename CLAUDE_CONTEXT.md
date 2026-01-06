# The Observer - Codebase Context

## Overview
Bilingual (EN/AR) geopolitical intelligence news platform. Aggregates content from Telegram channels via automated pipeline, displays with analytics dashboard.

**Live Site**: https://al-muraqeb.com

## Tech Stack
- **Framework**: Next.js 16.1.1 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (`@theme` directive in `globals.css`)
- **Database**: Supabase (PostgreSQL)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Telegram API**: Telethon (Python)

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

### GitHub Actions
- **Workflow**: `.github/workflows/fetch_telegram.yml`
- **Schedule**: Hourly cron + manual dispatch
- **Script**: `scripts/fetch_telegram.py`
  - Groups consecutive messages within 180 seconds
  - Combines multi-part posts into single articles
  - Cleans up orphaned continuation posts
  - Uses OpenAI for content analysis

## Critical Patterns

### i18n Architecture
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
- **Type guard**: `isValidLocale()` in middleware for safe locale validation

### File Structure
```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx           # Home (Hero, LiveFeed, SituationPreview, Intel, Community)
│   │   ├── frontline/         # News listing + [...slug] article detail
│   │   ├── situation-room/    # Full analytics dashboard
│   │   ├── about/             # Mission, Principles, Editorial Standards, Coverage
│   │   ├── dossier/           # Key figures (placeholder)
│   │   ├── chronicles/        # Timeline (placeholder)
│   │   ├── privacy/
│   │   ├── terms/
│   │   └── layout.tsx         # Locale layout with Header/Footer + skip-to-content
│   ├── api/
│   │   ├── articles/route.ts  # GET articles (with rate limiting)
│   │   ├── metrics/route.ts   # GET aggregated metrics
│   │   ├── subscribe/route.ts # POST newsletter signup
│   │   └── og/route.tsx       # Dynamic OG images (Edge)
│   └── globals.css            # Tailwind theme + custom utilities + focus styles
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Nav + language toggle + mobile menu
│   │   └── Footer.tsx         # Newsletter form + links
│   ├── sections/
│   │   ├── HeroSection.tsx    # Dynamic stats from useMetrics()
│   │   ├── LiveFeed.tsx       # Real-time article cards with skeleton loading
│   │   ├── SituationRoomPreview.tsx # Dynamic preview with real metrics
│   │   ├── IntelDashboard.tsx # Charts + metrics (imports Metrics type)
│   │   └── Community.tsx      # Telegram CTAs
│   └── ui/
│       └── BreakingNewsTicker.tsx # Uses useBreakingNews() hook
├── lib/
│   ├── supabase.ts            # Supabase client + dbArticleToFrontend()
│   ├── config.ts              # TELEGRAM_CHANNELS, CONTACT_EMAIL
│   ├── categories.ts          # Category display names per locale
│   ├── time.ts                # getRelativeTime(), formatDate() (imports Locale)
│   ├── hooks.ts               # useArticles(), useMetrics(), useBreakingNews(), Metrics type
│   └── rate-limit.ts          # In-memory rate limiting
├── middleware.ts              # Locale detection with isValidLocale() type guard
└── scripts/
    └── fetch_telegram.py      # Telegram fetcher + multi-part post grouping
```

### Component Props Pattern
All locale-aware components receive:
```typescript
interface ComponentProps {
  locale: Locale;
  dict: Dictionary;
}
```

### Hooks
```typescript
// src/lib/hooks.ts
export function useArticles(channel: 'en' | 'ar' | 'all'): { articles, loading, error }
export function useMetrics(): { metrics: Metrics | null, loading, error }
export function useBreakingNews(locale): { breakingNews: string[], loading }
export interface Metrics { ... }  // Single source of truth for metrics type
```

### Centralized Config
```typescript
// src/lib/config.ts
export const TELEGRAM_CHANNELS = {
  en: 'https://t.me/observer_5',
  ar: 'https://t.me/almuraqb',
};
export function getTelegramChannel(locale: Locale): string;
```

## Tailwind v4 Constraints
- **No dynamic classes**: `bg-${color}` won't work - use conditional: `isArabic ? 'text-right' : 'text-left'`
- **Theme in CSS**: Colors defined in `globals.css` under `@theme`
- **Custom utilities**: `scrollbar-hide`, focus-visible styles in globals.css

### Color Tokens (WCAG Compliant)
```css
--color-tactical-red: #dc2626      /* Primary accent, CTAs */
--color-tactical-amber: #d97706    /* Secondary accent */
--color-earth-olive: #84cc16       /* Success/positive */
--color-midnight-900: #0a0f14      /* Darkest background */
--color-midnight-800: #111920      /* Card backgrounds */
--color-midnight-700: #1a2332      /* Borders */
--color-slate-light: #f1f5f9       /* Primary text (~15:1 contrast) */
--color-slate-medium: #94a3b8      /* Secondary text (~7:1 contrast) */
--color-slate-dark: #64748b        /* Muted text (~5:1 contrast) */
```

## Database Schema (Supabase)

### articles
| Column | Type | Notes |
|--------|------|-------|
| id | serial | Auto-increment PK |
| telegram_id | text | Unique (e.g., "observer_5/336") |
| channel | text | 'en' or 'ar' |
| title | text | Extracted/generated |
| excerpt | text | First ~200 chars |
| content | text | Full article body |
| category | text | Military, Political, Economic, etc. |
| countries | text[] | Extracted country names |
| organizations | text[] | Extracted org names |
| is_structured | boolean | Has clear structure |
| telegram_link | text | Original Telegram URL |
| telegram_date | timestamptz | Original post date |
| created_at | timestamptz | DB insert time |
| updated_at | timestamptz | Last update time |

### subscribers
| Column | Type |
|--------|------|
| email | text (unique) |
| locale | text |
| is_active | boolean |
| subscribed_at | timestamptz |

## API Routes

### GET /api/articles
Query params: `channel` ('en' | 'ar' | 'all'), `limit`
Returns: `Article[]` or `{ en: Article[], ar: Article[] }`
- Uses `dbArticleToFrontend()` for transformation
- `isBreaking` based on category === 'Breaking'

### GET /api/metrics
Returns aggregated stats:
```typescript
{
  total_articles: number,
  countries: Record<string, number>,
  organizations: Record<string, number>,
  categories: Record<string, number>,
  temporal: { articles_today, articles_this_week, daily_trend[] },
  sentiment: { percentages: Record<string, number> },
  trending: { topic, mentions }[]
}
```

### POST /api/subscribe
Body: `{ email: string, locale?: Locale }`
Rate limited: 5 req/min per IP

## Accessibility Features
- **Skip-to-content**: Hidden link appears on Tab, jumps to `#main-content`
- **Focus-visible**: Red outline (2px) for keyboard navigation
- **Decorative icons**: `aria-hidden="true"`
- **Form inputs**: Associated `<label>` with `sr-only` class
- **Interactive elements**: `aria-label` for icon-only buttons
- **Reduced motion**: `@media (prefers-reduced-motion)` stops ticker animation

## Type Safety
- **Locale validation**: `isValidLocale()` type guard in middleware
- **Single Metrics type**: Defined in `hooks.ts`, imported elsewhere
- **Single Locale type**: Defined in `i18n/config.ts`, imported elsewhere
- **No `as any`**: Use proper type guards or type assertions

## Git Conventions
Commit format:
```
Short description

- Bullet points of changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Common Tasks

### Add new i18n string
1. Add to `dictionaries.ts` under both `en` and `ar` objects
2. Access via `dict.section.key`

### Add new country translation
1. Add to `dictionaries.ts` under `countries` in both `en` and `ar`
2. Use `getCountryName(country, locale)` to translate

### Add new page
1. Create `src/app/[locale]/pagename/page.tsx`
2. Use `generateStaticParams()` for static generation
3. Get dict: `const dict = getDictionary(locale as Locale)`

### Add new API route
1. Create `src/app/api/routename/route.ts`
2. Use rate limiting for public POST endpoints
3. Return `NextResponse.json()`

### Trigger article refresh
```bash
gh workflow run "Fetch Telegram Articles & Analyze"
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=           # For fetch_telegram.py
TELEGRAM_API_ID=          # For fetch_telegram.py
TELEGRAM_API_HASH=        # For fetch_telegram.py
```

## Scripts
```bash
npm run dev      # Development server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
```

## Known Warnings (Ignorable)
- "Next.js inferred workspace root" - multiple lockfiles, not an issue
- "metadataBase not set" - defaults to localhost in dev, set via environment

## Recent Changes (Jan 2026)
- Multi-part Telegram post combining (180s grouping window)
- Dynamic metrics on Hero and SituationRoomPreview
- Country tags with AR translations on Frontline page
- About page: Editorial Standards, Coverage Focus, Join Network sections
- Accessibility: skip-to-content link, focus-visible styles
- Type safety: isValidLocale() guard, consolidated type definitions
