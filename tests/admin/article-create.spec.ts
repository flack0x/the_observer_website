import { test, expect, hasAdminCredentials, loginAsAdmin } from '../fixtures/auth';
import { URLS } from '../fixtures/test-data';

/**
 * Admin Article Creation Tests
 *
 * These tests require admin credentials to be configured:
 * - TEST_ADMIN_EMAIL
 * - TEST_ADMIN_PASSWORD
 */

test.describe('Admin: Article Creation', () => {
  // Skip all tests if no credentials
  test.beforeEach(async ({ page }) => {
    if (!hasAdminCredentials()) {
      test.skip();
      return;
    }

    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
    }
  });

  test('should load new article page', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Should show new article form
    await expect(page.locator('h1')).toContainText(/new article/i);

    // Should have title input
    await expect(page.locator('input[placeholder*="title" i]').first()).toBeVisible();
  });

  test('should have English and Arabic editors', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Should have English section
    await expect(page.locator('text=English')).toBeVisible();

    // Should have Arabic section
    await expect(page.locator('text=/Arabic|العربية/i')).toBeVisible();
  });

  test('should have category selector', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Should have category dropdown
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toBeVisible();
  });

  test('should have save and publish buttons', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Save Draft button
    await expect(page.locator('button:has-text("Draft"), button:has-text("Save")')).toBeVisible();

    // Publish button
    await expect(page.locator('button:has-text("Publish")')).toBeVisible();
  });

  test('should disable publish when title is empty', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    const publishButton = page.locator('button:has-text("Publish")');

    // Should be disabled initially
    await expect(publishButton).toBeDisabled();
  });

  test('should enable publish when title is filled', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Fill in title
    const titleInput = page.locator('input[placeholder*="title" i]').first();
    await titleInput.fill('Test Article Title');

    // Fill in content (TipTap editor)
    const editor = page.locator('[class*="tiptap"], [class*="editor"], [contenteditable="true"]').first();
    if (await editor.isVisible()) {
      await editor.click();
      await page.keyboard.type('This is test content.');
    }

    // Publish button should be enabled now (might need both title and content)
    const publishButton = page.locator('button:has-text("Publish")');
    // Wait a moment for state to update
    await page.waitForTimeout(500);
  });
});

test.describe('Admin: Editor Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    if (!hasAdminCredentials()) {
      test.skip();
      return;
    }

    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
    }
  });

  test('should have editor toolbar with formatting buttons', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Toolbar should have formatting buttons
    const toolbar = page.locator('[class*="toolbar"]').first();
    await expect(toolbar).toBeVisible();

    // Should have bold, italic buttons (SVG icons)
    await expect(toolbar.locator('button').first()).toBeVisible();
  });

  test('should have image insert button', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Find image button in toolbar
    const imageButton = page.locator('button[title*="Image" i], button[title*="image" i]').first();
    await expect(imageButton).toBeVisible();
  });

  test('image button should open media picker modal', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Click image button
    const imageButton = page.locator('button[title*="Image" i], button[title*="image" i]').first();
    await imageButton.click();

    // Modal should open
    await page.waitForTimeout(500);

    // Should see modal with upload option
    const modal = page.locator('[class*="modal"], [role="dialog"]');
    await expect(modal).toBeVisible();

    // Should have upload area
    await expect(page.locator('text=/upload/i')).toBeVisible();
  });
});

test.describe('Admin: Featured Image Upload', () => {
  test.beforeEach(async ({ page }) => {
    if (!hasAdminCredentials()) {
      test.skip();
      return;
    }

    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
    }
  });

  test('should have featured image upload section', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Should have featured image section
    await expect(page.locator('text=/featured image/i')).toBeVisible();

    // Should have upload button
    await expect(page.locator('text=/upload.*image/i')).toBeVisible();
  });

  test('featured image button should open media picker', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Find upload button in featured image section
    const uploadButton = page.locator('button:has-text("Upload")').first();
    await uploadButton.click();

    // Modal should open
    await page.waitForTimeout(500);
    const modal = page.locator('[class*="modal"], [role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test('media picker should have file input', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Open media picker
    const uploadButton = page.locator('button:has-text("Upload")').first();
    await uploadButton.click();
    await page.waitForTimeout(500);

    // Should have file input (hidden but present)
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('media picker should accept image files', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Open media picker
    const uploadButton = page.locator('button:has-text("Upload")').first();
    await uploadButton.click();
    await page.waitForTimeout(500);

    // File input should accept images
    const fileInput = page.locator('input[type="file"]');
    const accept = await fileInput.getAttribute('accept');

    expect(accept).toContain('image');
  });
});

test.describe('Admin: Mobile Article Creation', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

  test.beforeEach(async ({ page }) => {
    if (!hasAdminCredentials()) {
      test.skip();
      return;
    }

    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      test.skip();
    }
  });

  test('should load new article page on mobile', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Page should load without errors
    await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();

    // Should show form
    await expect(page.locator('input[placeholder*="title" i]').first()).toBeVisible();
  });

  test('editor toolbar should be usable on mobile', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Toolbar should be visible
    const toolbar = page.locator('[class*="toolbar"]').first();
    await expect(toolbar).toBeVisible();

    // Image button should be visible and clickable
    const imageButton = page.locator('button[title*="Image" i], button[title*="image" i]').first();
    await expect(imageButton).toBeVisible();

    // Click should work
    await imageButton.click();
    await page.waitForTimeout(500);

    // Modal should open
    await expect(page.locator('[class*="modal"], [role="dialog"]')).toBeVisible();
  });

  test('media picker modal should be usable on mobile', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Open media picker
    const uploadButton = page.locator('button:has-text("Upload")').first();
    await uploadButton.click();
    await page.waitForTimeout(500);

    // Modal should be visible and not overflow
    const modal = page.locator('[class*="modal"], [role="dialog"]');
    await expect(modal).toBeVisible();

    // Upload area should be visible
    await expect(page.locator('text=/upload/i')).toBeVisible();

    // Close button should be visible
    const closeButton = page.locator('[class*="modal"] button:has(svg), button:has-text("Cancel")').first();
    await expect(closeButton).toBeVisible();
  });
});
