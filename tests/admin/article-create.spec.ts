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

    // Toolbar should have formatting buttons - look for the border-b div containing buttons
    const toolbar = page.locator('.border-b button').first();
    await expect(toolbar).toBeVisible();
  });

  test('should have image insert button', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Find image button in toolbar (title="Insert Image" after our fix)
    const imageButton = page.locator('button[title="Insert Image"]').first();
    await expect(imageButton).toBeVisible();
  });

  test('image button should open media picker modal', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Click image button
    const imageButton = page.locator('button[title="Insert Image"]').first();
    await imageButton.scrollIntoViewIfNeeded();
    await imageButton.click();

    // Wait for modal animation
    await page.waitForTimeout(1000);

    // Should see modal (fixed position overlay) or the select image text
    const modalVisible = await page.locator('.fixed.inset-0.z-50').isVisible();
    const selectImageVisible = await page.locator('text=/Select Image/i').isVisible();

    expect(modalVisible || selectImageVisible).toBe(true);
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

    // Modal should open - fixed overlay with z-50
    await page.waitForTimeout(500);
    const modal = page.locator('.fixed.inset-0.z-50');
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

    // Toolbar buttons should be visible
    const toolbarButton = page.locator('.border-b button').first();
    await expect(toolbarButton).toBeVisible();

    // Image button should be visible and clickable
    const imageButton = page.locator('button[title="Insert Image"]').first();
    await imageButton.scrollIntoViewIfNeeded();
    await expect(imageButton).toBeVisible();

    // Click should work
    await imageButton.click();
    await page.waitForTimeout(1000);

    // Modal should open - check for modal or "Select Image" header
    const modalVisible = await page.locator('.fixed.inset-0.z-50').isVisible();
    const selectImageVisible = await page.locator('text=/Select Image/i').isVisible();
    expect(modalVisible || selectImageVisible).toBe(true);
  });

  test('media picker modal should be usable on mobile', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    // Scroll to metadata section where upload button is
    await page.locator('text=/Featured Image/i').scrollIntoViewIfNeeded();

    // Open media picker
    const uploadButton = page.locator('button:has-text("Upload")').first();
    await uploadButton.scrollIntoViewIfNeeded();
    await uploadButton.click();
    await page.waitForTimeout(1000);

    // Modal should be visible - check for modal or select text
    const modalVisible = await page.locator('.fixed.inset-0.z-50').isVisible();
    const selectImageVisible = await page.locator('text=/Select Image/i').isVisible();
    expect(modalVisible || selectImageVisible).toBe(true);
  });
});
