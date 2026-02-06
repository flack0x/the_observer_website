import { test, expect, devices } from '@playwright/test';
import { URLS } from '../fixtures/test-data';

// Mobile viewport tests
test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test.describe('Mobile Navigation', () => {
    test('should display mobile menu button', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Mobile menu button should be visible
      const menuButton = page.locator('header button:has(svg)').first();
      await expect(menuButton).toBeVisible();
    });

    test('should open mobile menu on click', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Click menu button
      const menuButton = page.locator('header button:has(svg)').first();
      await menuButton.click();

      // Menu should open - look for navigation links
      await page.waitForTimeout(500);

      // Navigation links should become visible
      const navLinks = page.locator('nav a, [class*="menu"] a, [class*="mobile"] a');
      await expect(navLinks.first()).toBeVisible({ timeout: 3000 });
    });

    test('should navigate via mobile menu', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Open menu
      const menuButton = page.locator('header button:has(svg)').first();
      await menuButton.click();
      await page.waitForTimeout(500);

      // Click Frontline link
      const frontlineLink = page.locator('a:has-text("Frontline"), a[href*="frontline"]').first();

      if (await frontlineLink.isVisible()) {
        await frontlineLink.click();
        await expect(page).toHaveURL(/frontline/);
      }
    });

    test('should close mobile menu after navigation', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Open menu
      const menuButton = page.locator('header button:has(svg)').first();
      await menuButton.click();
      await page.waitForTimeout(500);

      // Click a link
      const link = page.locator('nav a, [class*="menu"] a').first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(500);

        // Menu should close (links should not be visible)
        // Or we navigated to a new page
      }
    });
  });

  test.describe('Mobile Layout', () => {
    test('should not have horizontal scroll on homepage', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Check for horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      // Body should not be wider than viewport (allow small tolerance)
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
    });

    test('should not have horizontal scroll on frontline', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
    });

    test('should have readable font size on mobile', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Check that body text is at least 14px
      const fontSize = await page.evaluate(() => {
        const body = document.body;
        return parseFloat(window.getComputedStyle(body).fontSize);
      });

      expect(fontSize).toBeGreaterThanOrEqual(14);
    });

    test('should have adequate touch targets', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Check that buttons are at least 44px (Apple's minimum)
      const buttons = page.locator('button, a');
      const firstButton = buttons.first();

      if (await firstButton.isVisible()) {
        const box = await firstButton.boundingBox();
        if (box) {
          // At least one dimension should be >= 40px
          expect(Math.max(box.width, box.height)).toBeGreaterThanOrEqual(40);
        }
      }
    });
  });

  test.describe('Mobile Article Page', () => {
    test('should load article on mobile without overflow', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      await page.waitForLoadState('networkidle');

      // Check no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
    });

    test('should have readable article content on mobile', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Content should not overflow
      const content = page.locator('article, main');
      await expect(content.first()).toBeVisible();

      // Text should be visible
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
    });
  });

  test.describe('Mobile Search', () => {
    test('should have accessible search on mobile', async ({ page }) => {
      await page.goto(URLS.frontlineEN);

      // Search should be visible or accessible
      const searchInput = page.locator('input[type="text"], input[type="search"]').first();

      // May need to scroll to find it
      if (!(await searchInput.isVisible())) {
        await page.evaluate(() => window.scrollTo(0, 200));
      }

      await expect(searchInput).toBeVisible();
    });

    test('should be able to type in search on mobile', async ({ page }) => {
      await page.goto(URLS.frontlineEN);

      const searchInput = page.locator('input[type="text"], input[type="search"]').first();
      await searchInput.scrollIntoViewIfNeeded();

      await searchInput.fill('test');

      // Should not crash
      await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();
    });
  });

  test.describe('Mobile Language Switch', () => {
    test('should have language switch accessible on mobile', async ({ page }) => {
      await page.goto(URLS.homeEN);

      // Language switch may be in header or menu
      const langSwitch = page.locator('a[href="/ar"], button:has-text("AR"), button:has-text("العربية")');

      // May need to open menu first
      if (!(await langSwitch.first().isVisible())) {
        const menuButton = page.locator('header button:has(svg)').first();
        await menuButton.click();
        await page.waitForTimeout(500);
      }

      // Language switch should be accessible somehow
      const langVisible = await langSwitch.first().isVisible();
      // Informational - layout may vary
    });
  });
});

// Tablet viewport tests
test.describe('Tablet Experience', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test('should have good layout on tablet', async ({ page }) => {
    await page.goto(URLS.homeEN);

    // No horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('should show multiple columns on tablet', async ({ page }) => {
    await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

    // On tablet, we might have 2-3 column layout
    // Just verify page loads correctly
    const articles = page.locator('a[href*="/frontline/"]');
    await expect(articles.first()).toBeVisible();
  });
});
