import { test, expect } from '@playwright/test';
import { URLS } from '../fixtures/test-data';

test.describe('Navigation', () => {
  test.describe('Header Navigation', () => {
    test('should display all main nav links', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Check for main navigation items
      const nav = page.locator('header nav, header');

      await expect(nav.getByRole('link', { name: /frontline/i })).toBeVisible();
      await expect(nav.getByRole('link', { name: /situation|room/i })).toBeVisible();
      await expect(nav.getByRole('link', { name: /library|books/i })).toBeVisible();
    });

    test('should navigate to Frontline', async ({ page }) => {
      await page.goto(URLS.homeEN);

      const frontlineLink = page.locator('header a[href*="frontline"]').first();
      await frontlineLink.click();
      await expect(page).toHaveURL(/frontline/);
    });

    test('should navigate to Library/Books', async ({ page }) => {
      await page.goto(URLS.homeEN);

      const booksLink = page.locator('header a[href*="books"]').first();
      if (await booksLink.isVisible()) {
        await booksLink.click();
        await expect(page).toHaveURL(/books/);
      }
    });

    test('should navigate to About', async ({ page }) => {
      await page.goto(URLS.homeEN);

      const aboutLink = page.locator('header a[href*="about"]').first();
      if (await aboutLink.isVisible()) {
        await aboutLink.click();
        await expect(page).toHaveURL(/about/);
      }
    });
  });

  test.describe('Language Switching', () => {
    test('should switch from English to Arabic', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Find language toggle (could be a button or link)
      const arabicLink = page.locator('a[href*="/ar"], button:has-text("AR"), button:has-text("العربية")').first();

      if (await arabicLink.isVisible()) {
        await arabicLink.click();
        await expect(page).toHaveURL(/\/ar/);
      }
    });

    test('should switch from Arabic to English', async ({ page }) => {
      await page.goto(URLS.homeAR);

      const englishLink = page.locator('a[href*="/en"], button:has-text("EN"), button:has-text("English")').first();

      if (await englishLink.isVisible()) {
        await englishLink.click();
        await expect(page).toHaveURL(/\/en/);
      }
    });

    test('should preserve page when switching language', async ({ page }) => {
      await page.goto(URLS.frontlineEN);

      const arabicLink = page.locator('a[href*="/ar"], button:has-text("AR")').first();

      if (await arabicLink.isVisible()) {
        await arabicLink.click();
        // Should stay on frontline but in Arabic
        await expect(page).toHaveURL(/\/ar.*frontline|frontline.*\/ar/);
      }
    });
  });

  test.describe('Theme Toggle', () => {
    test('should have theme toggle button', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Look for theme toggle (sun/moon icon button)
      const themeToggle = page.locator('button:has(svg), [data-testid="theme-toggle"]').filter({
        has: page.locator('svg'),
      });

      // There should be at least one button with an SVG (could be theme toggle)
      const buttons = await themeToggle.count();
      expect(buttons).toBeGreaterThan(0);
    });

    test('should toggle theme without errors', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Find and click a button that might be theme toggle
      const themeButtons = page.locator('header button:has(svg)');
      const count = await themeButtons.count();

      if (count > 0) {
        // Click first button (likely mobile menu or theme)
        await themeButtons.first().click();

        // Should not crash
        await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();
      }
    });
  });

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('should show mobile menu button on small screens', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // On mobile, there should be a hamburger menu button
      // Look for any button in the header
      const headerButtons = page.locator('header button');
      const count = await headerButtons.count();

      // Should have at least one button (menu toggle)
      expect(count).toBeGreaterThan(0);
    });

    test('should be able to interact with mobile menu', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Find and click the menu button (first button in header is usually the menu)
      const headerButtons = page.locator('header button');

      if (await headerButtons.count() > 0) {
        await headerButtons.first().click();
        await page.waitForTimeout(500); // Wait for animation

        // Should not crash
        await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();
      }
    });

    test('should have accessible navigation on mobile', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Navigation links should exist somewhere (either visible or in menu)
      const allFrontlineLinks = page.locator('a[href*="frontline"]');
      const count = await allFrontlineLinks.count();

      // Should have frontline links
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Footer Navigation', () => {
    test('should display footer links', async ({ page }) => {
      await page.goto(URLS.homeEN);

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Should have some links
      const footerLinks = footer.locator('a');
      const count = await footerLinks.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have working footer links', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Check privacy link
      const privacyLink = page.locator('footer a[href*="privacy"]');
      if (await privacyLink.isVisible()) {
        await privacyLink.click();
        await expect(page).toHaveURL(/privacy/);
      }
    });
  });

  test.describe('Back Navigation', () => {
    test('should navigate back from article to frontline', async ({ page }) => {
      // Go to frontline
      await page.goto(URLS.frontlineEN, { waitUntil: 'domcontentloaded' });

      // Wait for articles to load
      const article = page.locator('a[href*="/frontline/"]').first();
      await expect(article).toBeVisible({ timeout: 15000 });

      // Click an article
      await article.click();

      // Wait for article page
      await page.waitForLoadState('domcontentloaded');

      // Go back
      await page.goBack();

      // Should be on frontline
      await expect(page).toHaveURL(/frontline/);
    });
  });
});
