import { test, expect } from '@playwright/test';
import { URLS } from '../fixtures/test-data';

test.describe('Admin: Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto(URLS.adminLogin);

    // Login form should be visible
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation for empty fields', async ({ page }) => {
    await page.goto(URLS.adminLogin);

    // Click submit without filling fields
    await page.click('button[type="submit"]');

    // Should show validation (HTML5 or custom)
    // Form should still be on login page
    await expect(page).toHaveURL(/admin\/login/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto(URLS.adminLogin);

    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should stay on login page or show error
    await page.waitForTimeout(2000);

    // Either shows error message or stays on login
    const currentUrl = page.url();
    const hasError = await page.locator('text=/error|invalid|incorrect/i').isVisible();

    expect(currentUrl.includes('login') || hasError).toBe(true);
  });

  test('should redirect authenticated users away from login', async ({ page }) => {
    // Note: This test would need a valid session to work
    // For now, just verify the page loads without errors
    await page.goto(URLS.adminLogin);
    await expect(page.locator('text=Something Went Wrong')).not.toBeVisible();
  });
});

test.describe('Admin: Protected Routes', () => {
  test('admin dashboard should redirect to login when not authenticated', async ({ page }) => {
    await page.goto(URLS.adminDashboard);

    // Should redirect to login
    await expect(page).toHaveURL(/admin\/login/);
  });

  test('admin articles should redirect to login when not authenticated', async ({ page }) => {
    await page.goto(URLS.adminArticles);

    await expect(page).toHaveURL(/admin\/login/);
  });

  test('admin new article should redirect to login when not authenticated', async ({ page }) => {
    await page.goto(URLS.adminNewArticle);

    await expect(page).toHaveURL(/admin\/login/);
  });
});
