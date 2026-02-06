import { test, expect } from '@playwright/test';
import { URLS } from '../fixtures/test-data';

test.describe('Frontline (Articles)', () => {
  test.describe('Article Listing', () => {
    test('should load article listing page', async ({ page }) => {
      const response = await page.goto(URLS.frontlineEN);

      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();
    });

    test('should display articles', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      // Should have article cards/links
      const articles = page.locator('a[href*="/frontline/"]');
      await expect(articles.first()).toBeVisible({ timeout: 10000 });

      const count = await articles.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display article images', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      // Articles should have images
      const images = page.locator('a[href*="/frontline/"] img, [class*="article"] img');
      const count = await images.count();

      // At least some articles should have images
      expect(count).toBeGreaterThan(0);
    });

    test('should show article metadata (category, date)', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      // Should show categories like Military, Political, etc.
      const categoryText = page.locator('text=/Military|Political|Economic|Intelligence|Breaking|Analysis/i');
      await expect(categoryText.first()).toBeVisible();
    });
  });

  test.describe('Search', () => {
    test('should have search input', async ({ page }) => {
      await page.goto(URLS.frontlineEN);

      const searchInput = page.locator('input[type="text"], input[type="search"]').first();
      await expect(searchInput).toBeVisible();
    });

    test('should filter articles on search', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      // Get initial article count
      const initialArticles = page.locator('a[href*="/frontline/"]');
      await expect(initialArticles.first()).toBeVisible();

      // Type in search
      const searchInput = page.locator('input[type="text"], input[type="search"]').first();
      await searchInput.fill('Iran');

      // Wait for search to process
      await page.waitForTimeout(500);

      // Articles should still be visible (or show "no results")
      // We're testing that the search doesn't crash the page
      await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();
    });

    test('should handle empty search results gracefully', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const searchInput = page.locator('input[type="text"], input[type="search"]').first();
      await searchInput.fill('xyznonexistent12345');

      await page.waitForTimeout(500);

      // Should not crash - either shows "no results" message or empty list
      await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();
    });
  });

  test.describe('Category Filters', () => {
    test('should have category filter buttons', async ({ page }) => {
      await page.goto(URLS.frontlineEN);

      // Should have category buttons
      const categoryButtons = page.locator('button').filter({ hasText: /Military|Political|All/i });
      await expect(categoryButtons.first()).toBeVisible();
    });

    test('should filter by category', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      // Click on a category
      const militaryButton = page.locator('button').filter({ hasText: /Military/i }).first();

      if (await militaryButton.isVisible()) {
        await militaryButton.click();
        await page.waitForTimeout(300);

        // Should not crash
        await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();
      }
    });
  });

  test.describe('Arabic Version', () => {
    test('should load Arabic frontline page', async ({ page }) => {
      const response = await page.goto(URLS.frontlineAR);

      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator('text=حدث خطأ')).not.toBeVisible();
    });

    test('should display Arabic articles', async ({ page }) => {
      await page.goto(URLS.frontlineAR, { waitUntil: 'networkidle' });

      // Should have Arabic text
      const arabicText = page.locator('text=/[\\u0600-\\u06FF]{3,}/');
      await expect(arabicText.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Navigation to Article', () => {
    test('should navigate to article detail page', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      // Click first article
      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await expect(firstArticle).toBeVisible();

      await firstArticle.click();

      // Should navigate to article page
      await expect(page).toHaveURL(/\/frontline\//);

      // Article page should load without error
      await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();

      // Should have article title
      await expect(page.locator('h1')).toBeVisible();
    });
  });
});
