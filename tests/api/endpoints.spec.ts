import { test, expect } from '@playwright/test';
import { URLS } from '../fixtures/test-data';

test.describe('API: Other Endpoints', () => {
  test.describe('Books API', () => {
    test('GET /api/books should return 200', async ({ request }) => {
      const response = await request.get(URLS.apiBooks);
      expect(response.status()).toBe(200);
    });

    test('GET /api/books should return array', async ({ request }) => {
      const response = await request.get(URLS.apiBooks);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('GET /api/books?channel=en should filter books', async ({ request }) => {
      const response = await request.get(`${URLS.apiBooks}?channel=en`);
      const books = await response.json();

      if (books.length > 0) {
        expect(books[0].channel).toBe('en');
      }
    });
  });

  test.describe('Metrics API', () => {
    test('GET /api/metrics should return 200', async ({ request }) => {
      const response = await request.get(URLS.apiMetrics);
      expect(response.status()).toBe(200);
    });

    test('GET /api/metrics should return metrics object', async ({ request }) => {
      const response = await request.get(URLS.apiMetrics);
      const data = await response.json();

      expect(data).toHaveProperty('total_articles');
      expect(typeof data.total_articles).toBe('number');
    });
  });

  test.describe('Headlines API', () => {
    test('GET /api/headlines should return 200', async ({ request }) => {
      const response = await request.get(URLS.apiHeadlines);
      expect(response.status()).toBe(200);
    });

    test('GET /api/headlines should return array', async ({ request }) => {
      const response = await request.get(URLS.apiHeadlines);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  test.describe('RSS Feeds', () => {
    test('GET /feed/en should return valid XML', async ({ request }) => {
      const response = await request.get(URLS.rssEN);

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('xml');

      const text = await response.text();
      expect(text).toContain('<?xml');
      expect(text).toContain('<rss');
      expect(text).toContain('<channel>');
    });

    test('GET /feed/ar should return valid XML', async ({ request }) => {
      const response = await request.get(URLS.rssAR);

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('xml');
    });

    test('RSS feed should contain articles', async ({ request }) => {
      const response = await request.get(URLS.rssEN);
      const text = await response.text();

      expect(text).toContain('<item>');
      expect(text).toContain('<title>');
      expect(text).toContain('<link>');
    });
  });

  test.describe('Subscribe API', () => {
    test('POST /api/subscribe without email should return 400', async ({ request }) => {
      const response = await request.post(URLS.apiSubscribe, {
        data: {},
      });

      expect(response.status()).toBe(400);
    });

    test('POST /api/subscribe with invalid email should return 400', async ({ request }) => {
      const response = await request.post(URLS.apiSubscribe, {
        data: { email: 'invalid-email' },
      });

      expect(response.status()).toBe(400);
    });

    // Note: We don't test successful subscription to avoid adding test data to production
  });

  test.describe('Error Handling', () => {
    test('non-existent API should return 404', async ({ request }) => {
      const response = await request.get('/api/nonexistent');
      expect(response.status()).toBe(404);
    });

    test('malformed requests should not crash server', async ({ request }) => {
      const response = await request.get(`${URLS.apiArticles}?limit=invalid`);
      // Should return 200 with default behavior or 400, not 500
      expect(response.status()).not.toBe(500);
    });
  });
});
