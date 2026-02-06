import { test, expect } from '@playwright/test';
import { URLS, SELECTORS, EXPECTED_TEXT } from '../fixtures/test-data';

test.describe('Homepage', () => {
  test.describe('English Version', () => {
    test('should load without errors', async ({ page }) => {
      const response = await page.goto(URLS.homeEN);

      // Should not return error status
      expect(response?.status()).toBeLessThan(400);

      // Should not show error page
      await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();
      await expect(page.locator('text=Critical Error')).not.toBeVisible();
    });

    test('should display header with logo', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Header should be visible
      await expect(page.locator(SELECTORS.header)).toBeVisible();

      // Logo/site name should be present
      await expect(page.locator('header').getByText(/observer/i)).toBeVisible();
    });

    test('should display hero section', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Main heading should be visible
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
    });

    test('should display live feed with articles', async ({ page }) => {
      await page.goto(URLS.homeEN, { waitUntil: 'domcontentloaded' });

      // Wait for page to stabilize
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

      // Should have article links (they load dynamically)
      const articleLinks = page.locator('a[href*="/frontline/"]');
      await expect(articleLinks.first()).toBeVisible({ timeout: 15000 });

      // Should have at least one article
      const count = await articleLinks.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display footer', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Footer should be visible
      await expect(page.locator(SELECTORS.footer)).toBeVisible();
    });

    test('should have working navigation links', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Check Frontline link
      const frontlineLink = page.locator('header a[href*="frontline"]').first();
      await expect(frontlineLink).toBeVisible();
    });
  });

  test.describe('Arabic Version', () => {
    test('should load without errors', async ({ page }) => {
      const response = await page.goto(URLS.homeAR);

      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator('text=حدث خطأ')).not.toBeVisible();
    });

    test('should have RTL direction', async ({ page }) => {
      await page.goto(URLS.homeAR);

      // Check for RTL direction on body or main container
      const dir = await page.locator('body, html, [dir="rtl"]').first().getAttribute('dir');
      // Either body has dir=rtl or there's an element with dir=rtl
      const hasRTL = await page.locator('[dir="rtl"]').count();
      expect(hasRTL).toBeGreaterThan(0);
    });

    test('should display Arabic content', async ({ page }) => {
      await page.goto(URLS.homeAR);

      // Should have Arabic text somewhere on page
      const arabicText = page.locator('text=/[\\u0600-\\u06FF]/');
      await expect(arabicText.first()).toBeVisible();
    });
  });

  test.describe('SEO & Meta', () => {
    test('should have proper title', async ({ page }) => {
      await page.goto(URLS.homeEN);
      await expect(page).toHaveTitle(/Observer/i);
    });

    test('should have meta description', async ({ page }) => {
      await page.goto(URLS.homeEN);

      const metaDescription = page.locator('meta[name="description"]');
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(50);
    });

    test('should have canonical URL', async ({ page }) => {
      await page.goto(URLS.homeEN);

      const canonical = page.locator('link[rel="canonical"]');
      const href = await canonical.getAttribute('href');
      expect(href).toContain('al-muraqeb.com');
    });

    test('should have Open Graph tags', async ({ page }) => {
      await page.goto(URLS.homeEN);

      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(URLS.homeEN, { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;

      // Should load DOM in under 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should not have critical console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(URLS.homeEN, { waitUntil: 'domcontentloaded' });

      // Wait a bit for any async errors
      await page.waitForTimeout(2000);

      // Filter out known non-critical errors
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('hydration') &&
          !e.includes('Warning:') &&
          !e.includes('404') &&
          !e.includes('Failed to load resource') &&
          !e.includes('net::')
      );

      // Log any errors for debugging
      if (criticalErrors.length > 0) {
        console.log('Console errors found:', criticalErrors);
      }

      expect(criticalErrors).toHaveLength(0);
    });
  });
});
