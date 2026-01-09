// Single source of truth for article categories
// Must match the Python script (scripts/fetch_telegram.py)

export const CATEGORIES = {
  ALL: 'All',
  BREAKING: 'Breaking',
  MILITARY: 'Military',
  POLITICAL: 'Political',
  ECONOMIC: 'Economic',
  INTELLIGENCE: 'Intelligence',
  DIPLOMATIC: 'Diplomatic',
  ANALYSIS: 'Analysis',
  GEOPOLITICS: 'Geopolitics',
} as const;

export type Category = typeof CATEGORIES[keyof typeof CATEGORIES];

// Category list for filters (English)
export const CATEGORY_LIST_EN: Category[] = [
  CATEGORIES.ALL,
  CATEGORIES.BREAKING,
  CATEGORIES.MILITARY,
  CATEGORIES.POLITICAL,
  CATEGORIES.INTELLIGENCE,
  CATEGORIES.ECONOMIC,
  CATEGORIES.DIPLOMATIC,
  CATEGORIES.ANALYSIS,
  CATEGORIES.GEOPOLITICS,
];

// Category translations (Arabic)
export const CATEGORY_TRANSLATIONS: Record<Category, string> = {
  [CATEGORIES.ALL]: 'الكل',
  [CATEGORIES.BREAKING]: 'عاجل',
  [CATEGORIES.MILITARY]: 'عسكري',
  [CATEGORIES.POLITICAL]: 'سياسي',
  [CATEGORIES.ECONOMIC]: 'اقتصادي',
  [CATEGORIES.INTELLIGENCE]: 'استخباراتي',
  [CATEGORIES.DIPLOMATIC]: 'دبلوماسي',
  [CATEGORIES.ANALYSIS]: 'تحليل',
  [CATEGORIES.GEOPOLITICS]: 'جيوسياسي',
};

// Get localized category list
export function getCategoryList(locale: 'en' | 'ar'): string[] {
  if (locale === 'ar') {
    return CATEGORY_LIST_EN.map(cat => CATEGORY_TRANSLATIONS[cat]);
  }
  return CATEGORY_LIST_EN;
}

// Get category display name for a given locale
export function getCategoryDisplay(category: string, locale: 'en' | 'ar'): string {
  if (locale === 'ar') {
    return CATEGORY_TRANSLATIONS[category as Category] || category;
  }
  return category;
}

// Normalize category for filtering (handles both EN and AR input)
export function normalizeCategory(category: string): Category | null {
  // Check if it's already an English category
  const upperCategory = category.toUpperCase();
  for (const [key, value] of Object.entries(CATEGORIES)) {
    if (value.toUpperCase() === upperCategory) {
      return value as Category;
    }
  }

  // Check if it's an Arabic category
  for (const [enCat, arCat] of Object.entries(CATEGORY_TRANSLATIONS)) {
    if (arCat === category) {
      return enCat as Category;
    }
  }

  return null;
}

// Filter articles by category
export function filterByCategory<T extends { category: string }>(
  articles: T[],
  selectedCategory: string,
  locale: 'en' | 'ar'
): T[] {
  // "All" category - return everything
  const allCategory = locale === 'ar' ? CATEGORY_TRANSLATIONS[CATEGORIES.ALL] : CATEGORIES.ALL;
  if (selectedCategory === allCategory) {
    return articles;
  }

  // Normalize the selected category to English for comparison
  const normalizedSelected = normalizeCategory(selectedCategory);
  if (!normalizedSelected) {
    return articles;
  }

  return articles.filter(article => {
    const normalizedArticle = normalizeCategory(article.category);
    return normalizedArticle === normalizedSelected;
  });
}
