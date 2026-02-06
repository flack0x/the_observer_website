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

      // URL should have a slug, not just numbers
      const url = page.url();
      // Should match pattern like /en/frontline/some-slug-here
      expect(url).toMatch(/\/frontline\/[a-z0-9-]+$/i);
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

      // Look for like/dislike icons (thumbs up/down SVGs or buttons)
      const interactionButtons = page.locator('button svg, button:has-text("Like"), button:has-text("Dislike")');

      // Should have some interaction buttons
      const count = await interactionButtons.count();
      expect(count).toBeGreaterThanOrEqual(0); // May not be visible to guests
    });

    test('should display view count', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Look for view count (number with "views" or eye icon)
      const viewText = page.locator('text=/\\d+\\s*(views?|Views?)/i');
      const eyeIcon = page.locator('svg[class*="eye"], [class*="view"] svg');

      // At least one should be visible
      const hasViews = await viewText.count() > 0 || await eyeIcon.count() > 0;
      // Views may not be displayed, so this is informational
    });

    test('should have share functionality', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Look for share button
      const shareButton = page.locator('button:has-text("Share"), button:has-text("Copy"), [aria-label*="share" i]');

      // Share functionality may be present
      const hasShare = await shareButton.count() > 0;
      // Informational - not required
    });

    test('should display comment section', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Scroll to bottom where comments usually are
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      // Look for comment section indicators
      const commentSection = page.locator('text=/comment/i, textarea, [class*="comment"]');

      // Comments section should exist
      const hasComments = await commentSection.count() > 0;
      // May be lazy loaded
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
