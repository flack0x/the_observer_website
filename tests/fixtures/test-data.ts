/**
 * Test constants and selectors for The Observer
 */

// URLs
export const URLS = {
  // Public
  homeEN: '/en',
  homeAR: '/ar',
  frontlineEN: '/en/frontline',
  frontlineAR: '/ar/frontline',
  booksEN: '/en/books',
  booksAR: '/ar/books',
  voicesEN: '/en/voices',
  aboutEN: '/en/about',
  aboutAR: '/ar/about',
  rssEN: '/feed/en',
  rssAR: '/feed/ar',

  // Admin
  adminLogin: '/admin/login',
  adminDashboard: '/admin',
  adminArticles: '/admin/articles',
  adminNewArticle: '/admin/articles/new',
  adminBooks: '/admin/books',
  adminMedia: '/admin/media',

  // API
  apiArticles: '/api/articles',
  apiBooks: '/api/books',
  apiMetrics: '/api/metrics',
  apiHeadlines: '/api/headlines',
  apiSubscribe: '/api/subscribe',
};

// Selectors
export const SELECTORS = {
  // Navigation
  header: 'header',
  logo: 'header a[href="/en"], header a[href="/ar"]',
  mobileMenuButton: 'header button:has(svg)',
  navLink: 'nav a',

  // Homepage
  heroSection: 'main section:first-child',
  liveFeedSection: 'section:has(h2)',
  articleCard: 'article, [class*="card"], a[href*="/frontline/"]',
  breakingTicker: '[class*="ticker"], [class*="breaking"]',

  // Frontline
  searchInput: 'input[type="text"], input[type="search"]',
  categoryButton: 'button',
  articleLink: 'a[href*="/frontline/"]',
  articleImage: 'img',

  // Article Detail
  articleTitle: 'h1',
  articleContent: 'article, main [class*="content"]',
  shareButton: 'button:has(svg)',
  likeButton: 'button:has-text("Like"), button[aria-label*="like"]',

  // Books
  bookCard: 'a[href*="/books/"]',
  bookCover: 'img',
  bookTitle: 'h2, h3',

  // Admin
  loginForm: 'form',
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  submitButton: 'button[type="submit"]',
  sidebar: 'aside, nav[class*="sidebar"]',

  // Admin Editor
  titleInput: 'input[placeholder*="title" i], input[name*="title" i]',
  editorToolbar: '[class*="toolbar"]',
  imageButton: 'button[title="Insert Image"]',
  saveButton: 'button:has-text("Save"), button:has-text("Draft")',
  publishButton: 'button:has-text("Publish")',

  // Media Picker
  mediaModal: '[class*="modal"]',
  uploadArea: 'input[type="file"]',
  mediaGrid: '[class*="grid"]',

  // Footer
  footer: 'footer',
  footerLink: 'footer a',
};

// Expected text content (for assertions)
export const EXPECTED_TEXT = {
  en: {
    siteTitle: 'The Observer',
    heroHeading: /observe|intelligence|analysis/i,
    frontlineTitle: /frontline|news|articles/i,
    booksTitle: /library|books/i,
    aboutTitle: /about|mission/i,
  },
  ar: {
    siteTitle: 'المراقب',
    heroHeading: /راقب|استخبارات|تحليل/i,
    frontlineTitle: /الجبهة|أخبار|مقالات/i,
    booksTitle: /مكتبة|كتب/i,
    aboutTitle: /حول|المهمة/i,
  },
};

// Categories
export const CATEGORIES = [
  'Military',
  'Political',
  'Economic',
  'Intelligence',
  'Diplomatic',
  'Breaking',
  'Analysis',
  'Geopolitics',
];

// Test timeouts
export const TIMEOUTS = {
  navigation: 15000,
  apiResponse: 10000,
  animation: 1000,
  upload: 30000,
};
