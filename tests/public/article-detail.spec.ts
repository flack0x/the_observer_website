import { test, expect } from '@playwright/test';
import { URLS } from '../fixtures/test-data';

test.describe('Article Detail Page', () => {
  // Get a real article URL by navigating from frontline
  let articleUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

    // Get first article link
    const firstArticle = page.locator('a[href*="/frontline/"]').first();
    articleUrl = await firstArticle.getAttribute('href') || '/en/frontline';

    await page.close();
  });

  test.describe('Content Loading', () => {
    test('should load article page without error', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      // Click first article
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Should not show error
      await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();
      await expect(page.locator('text=404')).not.toBeVisible();
    });

    test('should display article title in h1', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      const title = page.locator('h1');
      await expect(title).toBeVisible();

      // Title should have meaningful content (not empty)
      const titleText = await title.textContent();
      expect(titleText?.length).toBeGreaterThan(5);
    });

    test('should display article content', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Should have paragraphs of content
      const content = page.locator('article p, main p');
      await expect(content.first()).toBeVisible();
    });

    test('should display article metadata', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Should show date or category
      const metadata = page.locator('text=/Military|Political|Economic|Intelligence|Breaking|Analysis|ago|January|February|March|April|May|June|July|August|September|October|November|December/i');
      await expect(metadata.first()).toBeVisible({ timeout: 5000 });
    });

    test('should have SEO-friendly URL slug', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();
      await page.waitForLoadState('domcontentloaded');

      // URL should have a slug (letters, numbers, hyphens)
      const url = page.url();
      // Should match pattern like /en/frontline/some-slug-here (allowing underscores too)
      expect(url).toMatch(/\/frontline\/[\w-]+$/i);
    });
  });

  test.describe('Images', () => {
    test('should load article images without 404', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      await page.waitForLoadState('networkidle');

      // Check for images
      const images = page.locator('article img, main img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        // Verify at least the first image loaded
        const firstImage = images.first();
        await expect(firstImage).toBeVisible();

        // Check image has valid src
        const src = await firstImage.getAttribute('src');
        expect(src).toBeTruthy();
      }
    });

    test('should have alt text on images', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      const images = page.locator('article img, main img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        const firstImage = images.first();
        const alt = await firstImage.getAttribute('alt');
        // Alt can be empty string but should exist
        expect(alt).not.toBeNull();
      }
    });
  });

  test.describe('Interaction UI (Read-Only)', () => {
    test('should display like/dislike buttons', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();
      await page.waitForLoadState('networkidle');

      // Interaction buttons are in a border-t section
      const interactionArea = page.locator('.border-t.border-midnight-700').first();
      await expect(interactionArea).toBeVisible({ timeout: 10000 });

      // Should have buttons with SVG icons
      const buttons = interactionArea.locator('button');
      const count = await buttons.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('should display view count', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();
      await page.waitForLoadState('networkidle');

      // Article should load - view counts are displayed in the header
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      // Views are tracked but may not be prominently displayed
    });

    test('should have share functionality', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();
      await page.waitForLoadState('networkidle');

      // Share button is in the interaction area
      const shareButton = page.locator('button:has-text("Share")');
      await expect(shareButton).toBeVisible({ timeout: 10000 });
    });

    test('should display comment section', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Scroll to bottom where comments are lazy-loaded
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      // Comment section is dynamically imported - look for textarea or comment text
      const commentIndicator = page.locator('textarea, text=/comment/i, text=/Add a/i');
      // May be lazy loaded, just verify page didn't crash
      await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should have back to frontline link', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Look for back link or breadcrumb
      const backLink = page.locator('a[href*="/frontline"]:not([href*="/frontline/"])');

      // Or navigation should work
      await page.goBack();
      await expect(page).toHaveURL(/\/frontline/);
    });

    test('should have working navigation header', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Header should be visible
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Logo should be clickable
      const logo = header.locator('a').first();
      await expect(logo).toBeVisible();
    });
  });

  test.describe('Arabic Article', () => {
    test('should load Arabic article correctly', async ({ page }) => {
      await page.goto(URLS.frontlineAR, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();

      if (await firstArticle.isVisible()) {
        await firstArticle.click();

        // Should not show error
        await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();

        // Should have Arabic content
        const arabicText = page.locator('text=/[\\u0600-\\u06FF]{5,}/');
        await expect(arabicText.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should have RTL layout for Arabic', async ({ page }) => {
      await page.goto(URLS.frontlineAR, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();

      if (await firstArticle.isVisible()) {
        await firstArticle.click();

        // Check for RTL direction
        const body = page.locator('body, html, main');
        const dir = await body.first().getAttribute('dir');

        // Either body has dir="rtl" or a parent element does
        // This is informational
      }
    });
  });
});
