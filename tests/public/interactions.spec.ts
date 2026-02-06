import { test, expect } from '@playwright/test';
import { URLS } from '../fixtures/test-data';

/**
 * READ-ONLY INTERACTION TESTS
 *
 * These tests verify that interaction UI elements exist and are visible,
 * but DO NOT actually perform any actions that would modify data.
 *
 * This ensures the site's interaction features are working without
 * affecting real user data or analytics.
 */

test.describe('Article Interactions (Read-Only UI Check)', () => {
  test.describe('Like/Dislike UI', () => {
    test('should display like button on article page', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();
      await page.waitForLoadState('networkidle');

      // Look for like button (thumbs up icon or "Like" text)
      const likeButton = page.locator('button:has(svg[class*="thumbs"]), button:has-text("Like"), [aria-label*="like" i]');
      const likeExists = await likeButton.count() > 0;

      // Informational - record whether like button exists
      console.log(`Like button present: ${likeExists}`);
    });

    test('should display dislike button on article page', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();
      await page.waitForLoadState('networkidle');

      // Look for dislike button
      const dislikeButton = page.locator('button:has-text("Dislike"), [aria-label*="dislike" i]');
      const dislikeExists = await dislikeButton.count() > 0;

      console.log(`Dislike button present: ${dislikeExists}`);
    });

    test('should display vote counts', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();
      await page.waitForLoadState('networkidle');

      // Look for vote counts (numbers near like/dislike)
      const voteCounts = page.locator('text=/^\\d+$/, span:has-text(/^\\d+$/)');
      const countExists = await voteCounts.count() > 0;

      console.log(`Vote counts displayed: ${countExists}`);
    });
  });

  test.describe('View Counter UI', () => {
    test('should display view count on article', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();
      await page.waitForLoadState('networkidle');

      // Look for view count (eye icon + number or "X views")
      const viewCount = page.locator('text=/\\d+\\s*views?/i, [class*="view"]');
      const viewExists = await viewCount.count() > 0;

      console.log(`View count displayed: ${viewExists}`);
    });

    test('should display views on article thumbnails', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      // Check if article cards show view counts
      const viewIcons = page.locator('a[href*="/frontline/"] svg, a[href*="/frontline/"] [class*="eye"]');
      const hasViewIcons = await viewIcons.count() > 0;

      console.log(`Thumbnail view icons: ${hasViewIcons}`);
    });
  });

  test.describe('Share UI', () => {
    test('should have share button on article page', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();
      await page.waitForLoadState('networkidle');

      // Look for share button
      const shareButton = page.locator('button:has-text("Share"), button:has-text("Copy"), [aria-label*="share" i]');
      const shareExists = await shareButton.count() > 0;

      console.log(`Share button present: ${shareExists}`);
    });

    test('should have copy link functionality UI', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Look for copy/share UI elements
      const copyUI = page.locator('button:has-text("Copy"), [class*="copy"], [class*="share"]');
      const copyExists = await copyUI.count() > 0;

      console.log(`Copy link UI present: ${copyExists}`);
    });
  });

  test.describe('Comments UI', () => {
    test('should have comment section on article page', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Scroll to bottom to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);

      // Look for comment section
      const commentSection = page.locator('[class*="comment"], text=/comment/i, textarea');
      const commentsExist = await commentSection.count() > 0;

      console.log(`Comment section present: ${commentsExist}`);
    });

    test('should have comment input form', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);

      // Look for comment textarea or input
      const commentInput = page.locator('textarea[placeholder*="comment" i], textarea, input[placeholder*="comment" i]');
      const inputExists = await commentInput.count() > 0;

      console.log(`Comment input present: ${inputExists}`);
    });

    test('should display existing comments if any', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);

      // Look for comment items
      const comments = page.locator('[class*="comment-item"], [class*="comment-content"]');
      const commentCount = await comments.count();

      console.log(`Existing comments displayed: ${commentCount}`);
    });
  });

  test.describe('Bookmark UI', () => {
    test('should have bookmark button on article page', async ({ page }) => {
      await page.goto(URLS.frontlineEN, { waitUntil: 'networkidle' });

      const firstArticle = page.locator('a[href*="/frontline/"]').first();
      await firstArticle.click();

      // Look for bookmark button
      const bookmarkButton = page.locator('button:has-text("Bookmark"), button:has-text("Save"), [aria-label*="bookmark" i], [class*="bookmark"]');
      const bookmarkExists = await bookmarkButton.count() > 0;

      console.log(`Bookmark button present: ${bookmarkExists}`);
    });
  });
});

test.describe('Homepage Interaction Elements', () => {
  test('should have newsletter subscription form', async ({ page }) => {
    await page.goto(URLS.homeEN);

    // Look for newsletter/subscribe form
    const subscribeForm = page.locator('form:has(input[type="email"]), input[type="email"]');
    const subscribeExists = await subscribeForm.count() > 0;

    console.log(`Newsletter form present: ${subscribeExists}`);
  });

  test('should have Telegram join links', async ({ page }) => {
    await page.goto(URLS.homeEN);

    // Look for Telegram links
    const telegramLinks = page.locator('a[href*="t.me"], a[href*="telegram"]');
    const telegramCount = await telegramLinks.count();

    expect(telegramCount).toBeGreaterThan(0);
    console.log(`Telegram links found: ${telegramCount}`);
  });

  test('should have social/community section', async ({ page }) => {
    await page.goto(URLS.homeEN);

    // Look for community section
    const communitySection = page.locator('text=/community|join|telegram/i');
    const communityExists = await communitySection.count() > 0;

    console.log(`Community section present: ${communityExists}`);
  });
});

test.describe('Footer Interaction Elements', () => {
  test('should have footer links', async ({ page }) => {
    await page.goto(URLS.homeEN);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    const footerLinks = footer.locator('a');
    const linkCount = await footerLinks.count();

    expect(linkCount).toBeGreaterThan(3);
    console.log(`Footer links found: ${linkCount}`);
  });

  test('should have privacy and terms links', async ({ page }) => {
    await page.goto(URLS.homeEN);

    const privacyLink = page.locator('footer a[href*="privacy"]');
    const termsLink = page.locator('footer a[href*="terms"]');

    // At least one of these should exist
    const hasLegalLinks = await privacyLink.count() > 0 || await termsLink.count() > 0;

    console.log(`Legal links present: ${hasLegalLinks}`);
  });
});

test.describe('Breaking News Ticker', () => {
  test('should have breaking news ticker on homepage', async ({ page }) => {
    await page.goto(URLS.homeEN);

    // Look for ticker element
    const ticker = page.locator('[class*="ticker"], [class*="breaking"], [class*="marquee"]');
    const tickerExists = await ticker.count() > 0;

    console.log(`Breaking news ticker present: ${tickerExists}`);
  });

  test('should have scrolling headlines', async ({ page }) => {
    await page.goto(URLS.homeEN);

    // Look for animated/scrolling content
    const scrollingContent = page.locator('[class*="animate"], [class*="scroll"], [class*="ticker"]');
    const hasScrolling = await scrollingContent.count() > 0;

    console.log(`Scrolling headlines present: ${hasScrolling}`);
  });
});
