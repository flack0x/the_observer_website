# The Observer - Codebase Context

## Overview
Bilingual (EN/AR) geopolitical intelligence news platform. Aggregates content from Telegram channels, displays with analytics dashboard.

## Tech Stack
- **Framework**: Next.js 16.1.1 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (`@theme` directive in `globals.css`)
- **Database**: Supabase (PostgreSQL)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

## Critical Patterns

### i18n Architecture
```
src/lib/i18n/
├── config.ts      # Locale types, locales array
├── dictionaries.ts # All EN/AR translations
└── index.ts       # Exports
```
- **Locale route**: `[locale]` dynamic segment (`/en/...`, `/ar/...`)
- **Dictionary access**: `getDictionary(locale)` - synchronous, no await needed
- **RTL**: `dir={isArabic ? 'rtl' : 'ltr'}` on section containers
- **Arabic font**: Noto Sans Arabic (configured in `layout.tsx`)

### File Structure
```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx           # Home
│   │   ├── frontline/         # News listing + [..slug] article detail
│   │   ├── situation-room/    # Analytics dashboard
│   │   ├── about/
│   │   ├── privacy/
│   │   ├── terms/
│   │   ├── layout.tsx         # Locale layout with Header/Footer
│   │   ├── not-found.tsx      # Locale-aware 404
│   │   └── error.tsx
│   ├── api/
│   │   ├── articles/route.ts  # GET articles from Supabase
│   │   ├── metrics/route.ts   # GET aggregated metrics
│   │   ├── subscribe/route.ts # POST newsletter signup
│   │   └── og/route.tsx       # Dynamic OG images (Edge)
│   └── globals.css            # Tailwind config + custom utilities
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Nav + language toggle + mobile menu
│   │   └── Footer.tsx         # Newsletter form + links
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── LiveFeed.tsx       # Real-time article cards
│   │   ├── IntelDashboard.tsx # Charts + metrics (auto-refresh 60s)
│   │   └── Community.tsx      # Telegram CTAs
│   └── ui/
│       └── BreakingNewsTicker.tsx
└── lib/
    ├── supabase.ts            # Supabase client
    ├── config.ts              # TELEGRAM_CHANNELS, CONTACT_EMAIL
    ├── categories.ts          # Category display names per locale
    ├── time.ts                # getRelativeTime(), formatDate()
    ├── hooks.ts               # useArticles() hook
    └── rate-limit.ts          # In-memory rate limiting
```

### Component Props Pattern
All locale-aware components receive:
```typescript
interface ComponentProps {
  locale: Locale;
  dict: Dictionary;
}
```

### Centralized Config
```typescript
// src/lib/config.ts
export const TELEGRAM_CHANNELS = {
  en: 'https://t.me/observer_5',
  ar: 'https://t.me/almuraqb',
};
export const CONTACT_EMAIL = 'contact@theobserver.com';
export function getTelegramChannel(locale: Locale): string;
```

## Tailwind v4 Constraints
- **No dynamic classes**: `bg-${color}` won't work - use static mappings
- **Theme in CSS**: Colors defined in `globals.css` under `@theme`
- **Custom utilities**: `scrollbar-hide` defined manually in globals.css

### Color Tokens
```css
--color-tactical-red: #B91C1C
--color-tactical-amber: #D4AF37
--color-earth-olive: #6B7B4C
--color-midnight-900: #0a0f14 (darkest)
--color-midnight-600: #374151
--color-slate-light/medium/dark: text colors
```

## Database Schema (Supabase)

### articles
| Column | Type | Notes |
|--------|------|-------|
| id | text | Primary key (telegram msg id) |
| title | text | |
| content | text | Full article body |
| excerpt | text | First ~200 chars |
| category | text | military, political, economic, etc. |
| date | timestamptz | Publication date |
| link | text | Original Telegram link |
| locale | text | 'en' or 'ar' |

### subscribers
| Column | Type |
|--------|------|
| email | text (unique) |
| locale | text |
| is_active | boolean |
| subscribed_at | timestamptz |

## API Routes

### GET /api/articles
Query params: `locale`, `limit`, `offset`
Returns: `{ articles: Article[], total: number }`

### GET /api/metrics
Returns aggregated stats: total articles, countries, organizations, sentiment, trending topics, daily trends.

### POST /api/subscribe
Body: `{ email: string, locale?: Locale }`
Rate limited: 5 req/min per IP

## Accessibility Conventions
- Decorative icons: `aria-hidden="true"`
- Form inputs: Associated `<label>` (sr-only if placeholder exists)
- Interactive elements: `aria-label` for icon-only buttons
- Focus states: `focus:ring-tactical-red` or `focus-within:` on wrappers

## Performance Patterns
- **Memoization**: Chart data in IntelDashboard uses `useMemo`
- **Auto-refresh**: `setInterval` with cleanup in `useEffect`
- **Image optimization**: Next.js `<Image>` with `fill` prop

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

### Add new page
1. Create `src/app/[locale]/pagename/page.tsx`
2. Use `generateStaticParams()` for static generation
3. Get dict: `const dict = getDictionary(locale as Locale)`

### Add new API route
1. Create `src/app/api/routename/route.ts`
2. Use rate limiting for public POST endpoints
3. Return `NextResponse.json()`

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Scripts
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
```

## Known Warnings (Ignorable)
- "Next.js inferred workspace root" - multiple lockfiles, not an issue
- "metadataBase not set" - defaults to localhost, set in production
