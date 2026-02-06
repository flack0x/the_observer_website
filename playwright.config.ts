import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * The Observer - Playwright Test Configuration
 *
 * Test against production (al-muraqeb.com) by default.
 * Set LOCAL=true to test against localhost:3000
 */

const isLocal = process.env.LOCAL === 'true';
const baseURL = isLocal ? 'http://localhost:3000' : 'https://al-muraqeb.com';

export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests */
  retries: process.env.CI ? 2 : 1,

  /* Limit workers to reduce RAM usage */
  workers: process.env.CI ? 1 : 2,

  /* Reporter - HTML for local, GitHub Actions compatible for CI */
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['html', { open: 'on-failure' }], ['list']],

  /* Global timeout for each test */
  timeout: 30000,

  /* Expect timeout */
  expect: {
    timeout: 10000,
  },

  /* Shared settings for all projects */
  use: {
    baseURL,

    /* Collect trace on failure for debugging */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'on-first-retry',

    /* Default navigation timeout */
    navigationTimeout: 15000,

    /* Default action timeout */
    actionTimeout: 10000,
  },

  /* Test projects - Desktop + Mobile */
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers (critical for our client's use case!)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Start local dev server if testing locally */
  ...(isLocal && {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  }),
});
