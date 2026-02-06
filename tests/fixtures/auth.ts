import { test as base, expect, Page } from '@playwright/test';

/**
 * Admin Authentication Fixture
 *
 * To use admin tests, set environment variables:
 * - TEST_ADMIN_EMAIL
 * - TEST_ADMIN_PASSWORD
 *
 * Or create a .env.test file (not committed to git)
 */

export interface AuthFixtures {
  authenticatedPage: Page;
}

// Check if admin credentials are configured
const hasAdminCredentials = () => {
  return !!(process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD);
};

// Login helper function
async function loginAsAdmin(page: Page): Promise<boolean> {
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('⚠️ Admin credentials not configured. Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    return false;
  }

  try {
    await page.goto('/admin/login');

    // Fill login form
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await page.waitForURL('/admin', { timeout: 10000 });

    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}

// Extended test with authentication
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loggedIn = await loginAsAdmin(page);

    if (!loggedIn) {
      // Skip test if login failed
      test.skip(!loggedIn, 'Admin credentials not configured or login failed');
    }

    await use(page);
  },
});

export { expect };
export { hasAdminCredentials, loginAsAdmin };
