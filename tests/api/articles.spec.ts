import { test, expect } from '@playwright/test';
import { URLS } from '../fixtures/test-data';

test.describe('API: Articles', () => {
  test('GET /api/articles should return 200', async ({ request }) => {
    const response = await request.get(URLS.apiArticles);

    expect(response.status()).toBe(200);
  });

  test('GET /api/articles should return JSON', async ({ request }) => {
    const response = await request.get(URLS.apiArticles);

    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('GET /api/articles should return articles object with en/ar', async ({ request }) => {
    const response = await request.get(URLS.apiArticles);
    const data = await response.json();

    // Without channel filter, returns { en: [...], ar: [...] }
    expect(data).toHaveProperty('en');
    expect(data).toHaveProperty('ar');
    expect(Array.isArray(data.en)).toBe(true);
    expect(Array.isArray(data.ar)).toBe(true);
  });

  test('articles should have required fields', async ({ request }) => {
    const response = await request.get(`${URLS.apiArticles}?channel=en`);
    const articles = await response.json();

    const article = articles[0];

    // Required fields
    expect(article).toHaveProperty('id');
    expect(article).toHaveProperty('title');
    expect(article).toHaveProperty('channel');
    expect(article).toHaveProperty('date');
  });

  test('GET /api/articles?channel=en should filter by channel', async ({ request }) => {
    const response = await request.get(`${URLS.apiArticles}?channel=en`);
    const articles = await response.json();

    expect(articles.length).toBeGreaterThan(0);

    // All articles should be English
    for (const article of articles.slice(0, 5)) {
      expect(article.channel).toBe('en');
    }
  });

  test('GET /api/articles?channel=ar should filter by channel', async ({ request }) => {
    const response = await request.get(`${URLS.apiArticles}?channel=ar`);
    const articles = await response.json();

    expect(articles.length).toBeGreaterThan(0);

    // All articles should be Arabic
    for (const article of articles.slice(0, 5)) {
      expect(article.channel).toBe('ar');
    }
  });

  test('GET /api/articles?channel=en&limit=5 should limit results', async ({ request }) => {
    const response = await request.get(`${URLS.apiArticles}?channel=en&limit=5`);
    const articles = await response.json();

    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeLessThanOrEqual(5);
  });

  test('GET /api/articles?search=Iran should search articles', async ({ request }) => {
    const response = await request.get(`${URLS.apiArticles}?channel=en&search=Iran`);
    const articles = await response.json();

    expect(response.status()).toBe(200);
    // Search should work without errors
    expect(Array.isArray(articles)).toBe(true);
  });

  test('articles should have valid dates', async ({ request }) => {
    const response = await request.get(`${URLS.apiArticles}?channel=en`);
    const articles = await response.json();

    expect(articles.length).toBeGreaterThan(0);
    const article = articles[0];
    const date = new Date(article.date);

    expect(date.toString()).not.toBe('Invalid Date');
  });
});
