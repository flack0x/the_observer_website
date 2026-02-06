import { test, expect } from '@playwright/test';

const BASE_URL = 'https://al-muraqeb.com';

/**
 * API HEALTH CHECK
 *
 * Quick tests to verify all API endpoints are responding.
 * Run this to get a fast overview of API health.
 */

test.describe('API Health Check', () => {
  test('GET /api/articles returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/articles`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/articles?channel=en returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/articles?channel=en`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/articles?channel=ar returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/articles?channel=ar`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/articles?search=Iran returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/articles?search=Iran`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/books returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/books`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/metrics returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/metrics`);
    expect(response.status()).toBe(200);
  });

  test('GET /api/headlines returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/headlines`);
    expect(response.status()).toBe(200);
  });

  test('GET /feed/en returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/feed/en`);
    expect(response.status()).toBe(200);
  });

  test('GET /feed/ar returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/feed/ar`);
    expect(response.status()).toBe(200);
  });

  test('GET /sitemap.xml returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`);
    expect(response.status()).toBe(200);
  });

  test('GET /robots.txt returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/robots.txt`);
    expect(response.status()).toBe(200);
  });
});

test.describe('API Response Validation', () => {
  test('articles API returns correct shape', async ({ request }) => {
    // Without channel param, returns { en: [], ar: [] }
    const response = await request.get(`${BASE_URL}/api/articles?limit=5`);
    const data = await response.json();

    expect(data).toHaveProperty('en');
    expect(data).toHaveProperty('ar');
    expect(Array.isArray(data.en)).toBe(true);
    expect(Array.isArray(data.ar)).toBe(true);
  });

  test('articles with channel param returns array', async ({ request }) => {
    // With channel param, returns array directly
    const response = await request.get(`${BASE_URL}/api/articles?channel=en&limit=5`);
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data.length).toBeLessThanOrEqual(5);
  });

  test('articles have required fields', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/articles?channel=en&limit=1`);
    const data = await response.json();
    const article = data[0];

    expect(article).toHaveProperty('id');
    expect(article).toHaveProperty('title');
    expect(article).toHaveProperty('channel');
  });

  test('books API returns array', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/books`);
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
  });

  test('metrics API returns object with data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/metrics`);
    const data = await response.json();

    expect(data).toHaveProperty('total_articles');
    expect(typeof data.total_articles).toBe('number');
  });

  test('RSS feed returns valid XML', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/feed/en`);
    const body = await response.text();

    expect(body).toContain('<?xml');
    expect(body).toContain('<rss');
    expect(body).toContain('<channel>');
    expect(body).toContain('<item>');
  });
});

test.describe('Page Health Check', () => {
  test('homepage EN returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/en`);
    expect(response.status()).toBe(200);
  });

  test('homepage AR returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/ar`);
    expect(response.status()).toBe(200);
  });

  test('frontline EN returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/en/frontline`);
    expect(response.status()).toBe(200);
  });

  test('frontline AR returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/ar/frontline`);
    expect(response.status()).toBe(200);
  });

  test('books EN returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/en/books`);
    expect(response.status()).toBe(200);
  });

  test('about EN returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/en/about`);
    expect(response.status()).toBe(200);
  });

  test('voices EN returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/en/voices`);
    expect(response.status()).toBe(200);
  });

  test('admin login returns 200', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/admin/login`);
    expect(response.status()).toBe(200);
  });
});

test.describe('Error Handling', () => {
  test('404 page for invalid article', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/en/frontline/this-article-does-not-exist-12345`);
    // Should return 404 or redirect
    expect([200, 404]).toContain(response.status());
  });

  test('invalid API parameters handled gracefully', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/articles?channel=invalid`);
    // Should return 200 with empty array or 400
    expect([200, 400]).toContain(response.status());
  });
});
