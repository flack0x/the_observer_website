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

### Supabase
- **Project**: `TheObserver`
- **Reference ID**: `gbqvivmfivsuvvdkoiuc`
- **Region**: South Asia (Mumbai)
- **Database**: PostgreSQL 17
- **CLI Version**: 2.72.7
- **Storage Bucket**: `article-media` (50MB limit, images/videos)

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
  2. `analyze_articles.py` - Computes metrics

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

**Sync State** (`scripts/.sync_state.json`):
- Tracks `last_message_id` per channel
- Tracks `last_sync` timestamp
- Used for incremental syncs

**Telegram Session** (`scripts/observer_session.session`):
- Local file-based session for development
- For CI/CD: use `TELEGRAM_SESSION_STRING` env var
- Generate with `scripts/generate_session_string.py`

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
│   │   ├── situation-room/          # Analytics dashboard
│   │   ├── dossier/                 # Key figures (placeholder)
│   │   ├── chronicles/              # Timeline (placeholder)
│   │   ├── about/                   # Mission, Editorial Standards
│   │   ├── privacy/
│   │   ├── terms/
│   │   └── layout.tsx               # Locale layout + Header/Footer
│   │
│   ├── admin/                       # Admin Dashboard
│   │   ├── page.tsx                 # Dashboard home
│   │   ├── layout.tsx               # Admin layout with sidebar
│   │   ├── AdminLayoutClient.tsx    # Client-side admin wrapper
│   │   ├── login/page.tsx           # Admin login
│   │   ├── signup/page.tsx          # Admin signup
│   │   ├── articles/                # Article management
│   │   │   ├── page.tsx             # List articles
│   │   │   ├── new/page.tsx         # Create article
│   │   │   └── [...id]/page.tsx     # Edit article
│   │   ├── books/                   # Book review management
│   │   │   ├── page.tsx             # List books
│   │   │   ├── new/page.tsx         # Create book review
│   │   │   └── [...id]/page.tsx     # Edit book review
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
│   │       ├── books/
│   │       │   ├── route.ts         # GET/POST admin books
│   │       │   └── [...id]/route.ts # GET/PUT/DELETE single book
│   │       ├── media/route.ts       # Media upload
│   │       └── users/route.ts       # User management
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
│   │   └── Community.tsx            # Telegram CTAs
│   ├── admin/
│   │   ├── layout/
│   │   │   ├── AdminSidebar.tsx     # Admin navigation
│   │   │   └── AdminHeader.tsx      # Admin top bar
│   │   ├── editor/
│   │   │   ├── TipTapEditor.tsx     # Rich text editor
│   │   │   └── EditorToolbar.tsx    # Editor toolbar
│   │   └── articles/
│   │       └── ArticlePreviewModal.tsx
│   └── ui/
│       ├── BreakingNewsTicker.tsx
│       └── ThemeToggle.tsx
│
├── lib/
│   ├── supabase.ts                  # Supabase client + converters
│   ├── supabase/
│   │   └── server.ts                # Server-side Supabase client
│   ├── config.ts                    # Telegram channels, contact email
│   ├── categories.ts                # Category display names
│   ├── time.ts                      # Date formatting utilities
│   ├── hooks.ts                     # useArticles, useMetrics, useBreakingNews, useBookReviews
│   ├── rate-limit.ts                # Rate limiting
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
| image_url | text | Article image |
| video_url | text | Article video |
| telegram_link | text | Original Telegram URL |
| telegram_date | timestamptz | Original post date |
| status | text | 'draft', 'published', 'archived' |
| published_at | timestamptz | Publication date |
| author_id | uuid | FK to auth.users |
| last_edited_by | uuid | FK to auth.users |
| created_at | timestamptz | DB insert time |
| updated_at | timestamptz | Last update time |

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

### Public APIs

**GET /api/articles**
- Query: `channel` ('en' | 'ar' | 'all'), `limit`
- Returns: `Article[]`

**GET /api/books**
- Query: `channel` ('en' | 'ar'), `limit`
- Returns: `BookReview[]`

**GET /api/metrics**
- Returns: Aggregated stats (counts, trends, etc.)

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
useArticles(channel: 'en' | 'ar' | 'all')
useMetrics()
useBreakingNews(locale)
useBookReviews(channel: 'en' | 'ar')
```

## Navigation Items

Desktop nav (in order):
1. Frontline (`/[locale]/frontline`)
2. Situation Room (`/[locale]/situation-room`)
3. Library (`/[locale]/books`)
4. Dossier (`/[locale]/dossier`)
5. Chronicles (`/[locale]/chronicles`)
6. About (`/[locale]/about`)

Admin sidebar:
1. Dashboard (`/admin`)
2. Articles (`/admin/articles`)
3. Books (`/admin/books`)
4. Media (`/admin/media`)
5. Users (`/admin/users`)
6. Settings (`/admin/settings`)

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
```

## Python Scripts (`scripts/`)

| Script | Purpose |
|--------|---------|
| `fetch_telegram.py` | Main article fetcher (Telegram → Supabase) |
| `analyze_articles.py` | Compute metrics from articles |
| `create_admin_user.js` | Create admin user in Supabase |
| `check_articles.py` | Validate articles in database |
| `upload_image.py` | Upload image to Supabase Storage |
| `publish_article.py` | Publish draft articles |
| `generate_session_string.py` | Generate Telegram session string |

**Python Dependencies** (`scripts/requirements.txt`):
```
telethon
python-dotenv
supabase
```

## Git Conventions

Commit format:
```
Short description

- Bullet points of changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
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

### Changes not showing on website
**Causes**:
1. Browser cache → Hard refresh (Ctrl+F5)
2. Vercel edge cache → Redeploy or wait
3. Database not updated → Run sync again

### Telegram session expired
**Fix**:
```bash
cd scripts
python login_telegram.py      # Re-authenticate
# Or generate new session string for CI/CD:
python generate_session_string.py
```

### Article content showing raw markdown
**Symptoms**: `**text**` or `__text__` visible instead of bold/italic

**Location**: `src/app/[locale]/frontline/[...slug]/ArticleContent.tsx`

**Fix**: The `processContent()` function converts Telegram markdown to HTML. If new formats appear:
1. Check the raw content in database
2. Update regex patterns in `processContent()`
3. Rebuild and deploy

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

## Database Stats (Jan 15, 2026)

| Table | Count | Notes |
|-------|-------|-------|
| Articles (EN) | 206 | 3 structured, 142 with images, 50 with videos |
| Articles (AR) | 233 | 4 structured, 154 with images, 59 with videos |
| Book Reviews | 14 | 7 EN, 7 AR published |
| User Profiles | 1 | Admin configured |
| Subscribers | 0 | Table ready |

## Recent Changes (Jan 2026)

- **Content Formatting Fix** (Jan 15): Telegram markdown to HTML conversion
  - `processContent()` in ArticleContent.tsx converts `**bold**` → `<strong>`
  - Converts `__italic__` → `<em>`
  - Strips header section (title/category/countries) from content body
  - Removes emoji markers (🔴🔵 etc.) from content
  - `sanitizeExcerpt()` cleans excerpts on article cards
  - Uses DOMPurify for XSS protection
- **Title Extraction Fix** (Jan 15): Comprehensive title parsing overhaul
  - Recognizes `**Title**` with value on next line
  - Handles `**Title : Value**` and `**Title: Value` inline formats
  - Strips emoji prefixes (🔴🔵 etc.) before parsing headers
  - Handles unclosed `**` in title lines
  - Skips metadata lines in legacy extraction
  - Frontend `sanitizeTitle()` as safety net
  - Lower char threshold (20) for multi-part grouping
- **Library (Book Reviews)**: Full bilingual book review system
  - Public listing + detail pages
  - Admin CRUD with TipTap editor
  - Rating system (1-5 stars)
  - Recommendation levels (essential/recommended/optional)
  - Local book cover images
- **Admin Dashboard**: Complete content management system
  - Article management (create, edit, delete)
  - Book review management
  - Media library
  - User management
- **Theme System**: Light/dark mode toggle
- **Navigation**: Shortened names (Frontline, Library, Dossier)
- **Mobile Optimization**: Improved book detail page mobile layout
- **Multi-part Telegram post combining** (180s grouping window)
- **Country tags** with AR translations on Frontline
- **Accessibility**: skip-to-content, focus-visible styles
- **Database**: 11 migrations, PostgreSQL 17
- **RLS Policies**: Optimized for performance, role-based access
- **SEO Overhaul** (Jan 17): Critical fixes for Google indexing
  - Changed all URLs from `the-observer-website.vercel.app` to `al-muraqeb.com`
  - Files updated: `sitemap.ts`, `robots.ts`, article/book page JSON-LD, OG route
  - Added hreflang tags for EN↔AR language alternates with x-default
  - Made canonical URLs absolute (full domain)
  - Added book reviews to sitemap (was missing)
  - Added `/books` to static paths in sitemap
  - Google Search Console verified via DNS TXT record
  - Sitemap submitted: 228 pages discovered
  - Added ESLint configuration (`eslint.config.mjs`)
  - Updated metadataBase to production domain

## Google Search Console

- **Property**: al-muraqeb.com (Domain property)
- **Verification**: DNS TXT record (Namecheap)
- **Sitemap**: https://al-muraqeb.com/sitemap.xml (228 pages)
- **Verification Code**: `google-site-verification=6GZxTpIryls2s95Zkl3jkPxpPsYlvW3LGnEe4L6Qm2k`
- **Status**: Verified, sitemap submitted Jan 17, 2026
