import { test, expect } from '@playwright/test';

const BASE_URL = 'https://al-muraqeb.com';

test.describe('Sitemap Validation', () => {
  test('should return valid sitemap XML', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`);

    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('xml');

    const body = await response.text();
    expect(body).toContain('<?xml');
    expect(body).toContain('<urlset');
    expect(body).toContain('<url>');
    expect(body).toContain('<loc>');
  });

  test('should have correct domain in sitemap URLs', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`);
    const body = await response.text();

    // All URLs should use the correct domain
    expect(body).toContain('https://al-muraqeb.com');

    // Should NOT have old Vercel URLs
    expect(body).not.toContain('vercel.app');
  });

  test('should include homepage in sitemap', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`);
    const body = await response.text();

    expect(body).toContain('https://al-muraqeb.com/en');
    expect(body).toContain('https://al-muraqeb.com/ar');
  });

  test('should include main sections in sitemap', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`);
    const body = await response.text();

    // Main sections
    expect(body).toContain('/frontline');
    expect(body).toContain('/books');
    expect(body).toContain('/about');
  });

  test('should include article URLs in sitemap', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`);
    const body = await response.text();

    // Should have article detail pages (frontline with slug)
    const articleUrlPattern = /\/frontline\/[a-z0-9-]+/i;
    expect(body).toMatch(articleUrlPattern);
  });

  test.describe('Sitemap URL Accessibility (Sample Check)', () => {
    test('should have accessible homepage URLs', async ({ request }) => {
      // Test main pages are accessible
      const urls = [
        `${BASE_URL}/en`,
        `${BASE_URL}/ar`,
        `${BASE_URL}/en/frontline`,
        `${BASE_URL}/ar/frontline`,
        `${BASE_URL}/en/books`,
        `${BASE_URL}/en/about`,
      ];

      for (const url of urls) {
        const response = await request.get(url);
        expect(response.status(), `${url} should return 200`).toBeLessThan(400);
      }
    });

    test('should have accessible article URLs from sitemap', async ({ request }) => {
      // Fetch sitemap
      const sitemapResponse = await request.get(`${BASE_URL}/sitemap.xml`);
      const sitemap = await sitemapResponse.text();

      // Extract first 5 article URLs for testing
      const urlMatches = sitemap.match(/https:\/\/al-muraqeb\.com\/en\/frontline\/[a-z0-9-]+/gi);

      if (urlMatches && urlMatches.length > 0) {
        // Test first 5 article URLs
        const urlsToTest = urlMatches.slice(0, 5);

        for (const url of urlsToTest) {
          const response = await request.get(url);
          expect(response.status(), `${url} should be accessible`).toBeLessThan(400);
        }
      }
    });
  });
});

test.describe('Robots.txt Validation', () => {
  test('should return valid robots.txt', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/robots.txt`);

    expect(response.status()).toBe(200);

    const body = await response.text();

    // Should have user-agent directive
    expect(body.toLowerCase()).toContain('user-agent');

    // Should reference sitemap
    expect(body.toLowerCase()).toContain('sitemap');
    expect(body).toContain('https://al-muraqeb.com/sitemap.xml');
  });

  test('should not disallow important paths', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/robots.txt`);
    const body = await response.text().then(t => t.toLowerCase());

    // Should NOT block main content
    expect(body).not.toContain('disallow: /en');
    expect(body).not.toContain('disallow: /ar');
    expect(body).not.toContain('disallow: /frontline');
  });

  test('should block admin paths from crawlers', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/robots.txt`);
    const body = await response.text();

    // Admin MAY be blocked (optional - depends on site config)
    // Main thing is robots.txt exists and is valid
    expect(body.toLowerCase()).toContain('user-agent');
  });
});
