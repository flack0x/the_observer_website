# The Observer - Playwright Test Suite

## Overview

End-to-end test suite for al-muraqeb.com using Playwright. Tests run against production by default, with option to test locally.

## Quick Reference

```bash
# Run all tests against production
npx playwright test

# Run all tests against localhost
LOCAL=true npx playwright test

# Run specific test file
npx playwright test tests/public/homepage.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=mobile-safari

# Run tests in UI mode (visual debugging)
npx playwright test --ui

# Run tests in headed mode (see the browser)
npx playwright test --headed

# View last test report
npx playwright show-report
```

## Test Structure

```
tests/
├── public/                    # Public site tests (no auth required)
│   ├── homepage.spec.ts       # Homepage, hero, live feed
│   ├── navigation.spec.ts     # Nav links, language switch, theme
│   ├── frontline.spec.ts      # Article listing, filters, search
│   ├── article.spec.ts        # Article detail, interactions
│   ├── books.spec.ts          # Library section
│   ├── voices.spec.ts         # External voices section
│   └── rss.spec.ts            # RSS feed validation
│
├── admin/                     # Admin dashboard tests (auth required)
│   ├── auth.spec.ts           # Login, logout, session
│   ├── articles.spec.ts       # Article CRUD, list, filters
│   ├── article-create.spec.ts # Create article flow
│   ├── article-edit.spec.ts   # Edit article flow
│   ├── media-upload.spec.ts   # Image/video upload (THE BUG!)
│   └── books.spec.ts          # Book review management
│
├── api/                       # API endpoint tests
│   ├── articles.spec.ts       # GET /api/articles
│   ├── books.spec.ts          # GET /api/books
│   ├── metrics.spec.ts        # GET /api/metrics
│   └── subscribe.spec.ts      # POST /api/subscribe
│
├── mobile/                    # Mobile-specific tests
│   ├── navigation.spec.ts     # Mobile menu, touch
│   └── admin-upload.spec.ts   # Mobile image upload
│
└── fixtures/                  # Test utilities
    ├── auth.ts                # Admin authentication helper
    └── test-data.ts           # Test constants
```

## Critical Test Scenarios

### Priority 1: Client's Reported Issues
| Test | File | Description |
|------|------|-------------|
| Mobile image upload | `admin/media-upload.spec.ts` | Upload image from device in editor |
| Error page recovery | `public/homepage.spec.ts` | Site loads without errors |

### Priority 2: Core User Flows
| Test | File | Description |
|------|------|-------------|
| Homepage loads | `public/homepage.spec.ts` | EN/AR homepage renders |
| Article listing | `public/frontline.spec.ts` | Articles display, pagination |
| Article detail | `public/article.spec.ts` | Single article view |
| Search works | `public/frontline.spec.ts` | Full-text search |
| Language switch | `public/navigation.spec.ts` | EN↔AR switching |
| Admin login | `admin/auth.spec.ts` | Authentication flow |
| Create article | `admin/article-create.spec.ts` | Full creation flow |

### Priority 3: Secondary Flows
| Test | File | Description |
|------|------|-------------|
| Theme toggle | `public/navigation.spec.ts` | Light/dark mode |
| RSS feeds | `public/rss.spec.ts` | XML validation |
| Book reviews | `public/books.spec.ts` | Library section |
| API responses | `api/*.spec.ts` | Endpoint validation |

## Test Data & Selectors

### Common Selectors
```typescript
// Navigation
const NAV = {
  header: 'header',
  logo: 'a[href="/en"], a[href="/ar"]',
  mobileMenuButton: 'button[aria-label*="menu"]',
  languageToggle: '[data-testid="language-toggle"]',
  themeToggle: '[data-testid="theme-toggle"]',
};

// Homepage
const HOME = {
  hero: '[data-testid="hero-section"]',
  liveFeed: '[data-testid="live-feed"]',
  articleCard: '[data-testid="article-card"]',
};

// Frontline
const FRONTLINE = {
  searchInput: 'input[placeholder*="Search"]',
  categoryFilter: '[data-testid="category-filter"]',
  articleList: '[data-testid="article-list"]',
};

// Admin
const ADMIN = {
  loginForm: 'form',
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  submitButton: 'button[type="submit"]',
  articleEditor: '[data-testid="tiptap-editor"]',
  imageButton: 'button[title="Insert Image"]',
  mediaPickerModal: '[data-testid="media-picker"]',
  uploadInput: 'input[type="file"]',
};
```

### Test URLs
```typescript
const URLS = {
  // Public
  homeEN: '/en',
  homeAR: '/ar',
  frontlineEN: '/en/frontline',
  frontlineAR: '/ar/frontline',
  booksEN: '/en/books',
  voicesEN: '/en/voices',
  rssEN: '/feed/en',
  rssAR: '/feed/ar',

  // Admin
  adminLogin: '/admin/login',
  adminDashboard: '/admin',
  adminArticles: '/admin/articles',
  adminNewArticle: '/admin/articles/new',
  adminBooks: '/admin/books',
  adminMedia: '/admin/media',

  // API
  apiArticles: '/api/articles',
  apiBooks: '/api/books',
  apiMetrics: '/api/metrics',
  apiHeadlines: '/api/headlines',
};
```

## Authentication

Admin tests require authentication. Use the auth fixture:

```typescript
// tests/fixtures/auth.ts
import { test as base, Page } from '@playwright/test';

// Extend base test with authenticated page
export const test = base.extend<{ adminPage: Page }>({
  adminPage: async ({ page }, use) => {
    // Login
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL!);
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    await use(page);

    // Cleanup - logout
    // await page.goto('/admin/logout');
  },
});

export { expect } from '@playwright/test';
```

**Environment variables for auth tests:**
```bash
# .env.test (do NOT commit)
TEST_ADMIN_EMAIL=your-test-admin@example.com
TEST_ADMIN_PASSWORD=your-test-password
```

## Running Tests

### Local Development
```bash
# Start dev server and run tests
LOCAL=true npx playwright test

# Run specific test with debug
LOCAL=true npx playwright test tests/public/homepage.spec.ts --debug
```

### Against Production
```bash
# Run all tests (default: production)
npx playwright test

# Run only public tests (no auth needed)
npx playwright test tests/public/

# Run mobile tests
npx playwright test --project=mobile-chrome --project=mobile-safari
```

### CI/CD (GitHub Actions)
```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run tests
        run: npx playwright test tests/public/
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

### 1. Use data-testid attributes
Add `data-testid` to components for stable selectors:
```tsx
<button data-testid="publish-button">Publish</button>
```

### 2. Wait for network idle
For pages with data fetching:
```typescript
await page.goto('/en/frontline', { waitUntil: 'networkidle' });
```

### 3. Test both languages
```typescript
for (const locale of ['en', 'ar']) {
  test(`homepage loads in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page).toHaveTitle(/Observer/);
  });
}
```

### 4. Mobile-first for upload tests
The client's bug was on mobile - always test uploads on mobile:
```typescript
test.describe('mobile upload', () => {
  test.use({ ...devices['iPhone 12'] });

  test('can upload image from gallery', async ({ page }) => {
    // ...
  });
});
```

### 5. Screenshot comparisons for visual bugs
```typescript
await expect(page).toHaveScreenshot('homepage.png');
```

## Debugging Failed Tests

1. **View HTML report:**
   ```bash
   npx playwright show-report
   ```

2. **Watch trace:**
   Failed tests save traces. Open in trace viewer:
   ```bash
   npx playwright show-trace trace.zip
   ```

3. **Run in debug mode:**
   ```bash
   npx playwright test --debug
   ```

4. **Run in headed mode:**
   ```bash
   npx playwright test --headed
   ```

## Test Coverage Goals

| Area | Coverage Target | Current |
|------|-----------------|---------|
| Public pages | 100% | 0% |
| Admin CRUD | 100% | 0% |
| API endpoints | 100% | 0% |
| Mobile flows | 100% | 0% |
| Error handling | 80% | 0% |

## Known Issues & Workarounds

### Windows Security Warning
Playwright's `PrintDeps.exe` may trigger Windows Defender. This is a false positive - allow it in Windows Security settings.

### Admin Auth in CI
For CI, either:
1. Skip admin tests: `npx playwright test tests/public/`
2. Use test account credentials as GitHub secrets

### Supabase Rate Limits
If running many tests, you may hit Supabase rate limits. Add delays:
```typescript
test.beforeEach(async () => {
  await new Promise(r => setTimeout(r, 500));
});
```
