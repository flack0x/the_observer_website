import type { Locale } from './config';

const dictionaries = {
  en: {
    // Navigation
    nav: {
      frontline: 'The Frontline',
      deepDives: 'Deep Dives',
      intelligence: 'Intelligence',
      situationRoom: 'Situation Room',
      dossier: 'The Dossier',
      arsenal: 'The Arsenal',
      sources: 'Primary Sources',
      counterNarrative: 'Counter-Narrative',
      library: 'The Library',
      chronicles: 'Chronicles',
      joinIntel: 'Join Intel',
    },
    // Navigation descriptions
    navDesc: {
      frontline: 'Breaking News',
      deepDives: 'Geopolitical Analysis',
      situationRoom: 'Interactive Maps',
      dossier: 'Key Figures',
      arsenal: 'Military Analysis',
      sources: 'Document Archive',
      counterNarrative: 'Media Critique',
      library: 'Book Reviews',
      chronicles: 'Historical Timeline',
    },
    // Header
    header: {
      title: 'THE OBSERVER',
      subtitle: 'Intelligence & Analysis',
      live: 'Live',
    },
    // Common
    common: {
      readMore: 'Read More',
      viewAll: 'View All',
      backTo: 'Back to',
      share: 'Share',
      viewOnTelegram: 'View on Telegram',
      loading: 'Loading...',
      noArticles: 'No articles found',
      search: 'Search',
    },
    // Home page
    home: {
      heroTitle: 'Geopolitical Intelligence',
      heroSubtitle: 'In-depth analysis of global conflicts and power dynamics',
      latestIntel: 'Latest Intel',
      featuredAnalysis: 'Featured Analysis',
      liveFeed: 'Live Feed',
      intelDashboard: 'Analytics Dashboard',
      liveIntelligence: 'Live Intelligence',
      fullDashboard: 'Full Dashboard',
    },
    // Frontline page
    frontline: {
      title: 'The Frontline',
      subtitle: 'Breaking news and real-time intelligence from conflict zones',
      backToFrontline: 'Back to Frontline',
    },
    // Categories
    categories: {
      military: 'Military',
      political: 'Political',
      economic: 'Economic',
      intelligence: 'Intelligence',
      diplomatic: 'Diplomatic',
      breaking: 'Breaking',
      analysis: 'Analysis',
    },
    // Time
    time: {
      justNow: 'Just now',
      minutesAgo: '{n} minutes ago',
      hoursAgo: '{n} hours ago',
      daysAgo: '{n} days ago',
      today: 'Today',
      yesterday: 'Yesterday',
    },
    // Dashboard
    dashboard: {
      totalArticles: 'Total Articles',
      thisWeek: 'This Week',
      today: 'today',
      countries: 'Countries',
      organizations: 'Organizations',
      activity7Day: '7-Day Activity',
      topRegions: 'Top Regions',
      trendingNow: 'Trending Now',
      contentSentiment: 'Content Sentiment',
      negative: 'Negative',
      neutral: 'Neutral',
      positive: 'Positive',
    },
    // Footer
    footer: {
      about: 'About',
      contact: 'Contact',
      privacy: 'Privacy',
      terms: 'Terms',
      copyright: '© 2024 The Observer. All rights reserved.',
      description: 'Independent geopolitical analysis and intelligence coverage.',
    },
  },
  ar: {
    // Navigation
    nav: {
      frontline: 'الجبهة',
      deepDives: 'تحليلات معمقة',
      intelligence: 'الاستخبارات',
      situationRoom: 'غرفة العمليات',
      dossier: 'الملفات',
      arsenal: 'الترسانة',
      sources: 'المصادر الأولية',
      counterNarrative: 'الرواية المضادة',
      library: 'المكتبة',
      chronicles: 'السجلات',
      joinIntel: 'انضم إلينا',
    },
    // Navigation descriptions
    navDesc: {
      frontline: 'أخبار عاجلة',
      deepDives: 'تحليل جيوسياسي',
      situationRoom: 'خرائط تفاعلية',
      dossier: 'شخصيات رئيسية',
      arsenal: 'تحليل عسكري',
      sources: 'أرشيف الوثائق',
      counterNarrative: 'نقد إعلامي',
      library: 'مراجعات الكتب',
      chronicles: 'الخط الزمني',
    },
    // Header
    header: {
      title: 'المُراقِب',
      subtitle: 'استخبارات وتحليل',
      live: 'مباشر',
    },
    // Common
    common: {
      readMore: 'اقرأ المزيد',
      viewAll: 'عرض الكل',
      backTo: 'العودة إلى',
      share: 'مشاركة',
      viewOnTelegram: 'عرض على تيليجرام',
      loading: 'جاري التحميل...',
      noArticles: 'لا توجد مقالات',
      search: 'بحث',
    },
    // Home page
    home: {
      heroTitle: 'استخبارات جيوسياسية',
      heroSubtitle: 'تحليل معمق للصراعات العالمية وديناميكيات القوى',
      latestIntel: 'آخر المعلومات',
      featuredAnalysis: 'تحليلات مميزة',
      liveFeed: 'البث المباشر',
      intelDashboard: 'لوحة التحليلات',
      liveIntelligence: 'استخبارات حية',
      fullDashboard: 'اللوحة الكاملة',
    },
    // Frontline page
    frontline: {
      title: 'الجبهة',
      subtitle: 'أخبار عاجلة ومعلومات فورية من مناطق الصراع',
      backToFrontline: 'العودة إلى الجبهة',
    },
    // Categories
    categories: {
      military: 'عسكري',
      political: 'سياسي',
      economic: 'اقتصادي',
      intelligence: 'استخباراتي',
      diplomatic: 'دبلوماسي',
      breaking: 'عاجل',
      analysis: 'تحليل',
    },
    // Time
    time: {
      justNow: 'الآن',
      minutesAgo: 'منذ {n} دقيقة',
      hoursAgo: 'منذ {n} ساعة',
      daysAgo: 'منذ {n} يوم',
      today: 'اليوم',
      yesterday: 'أمس',
    },
    // Dashboard
    dashboard: {
      totalArticles: 'إجمالي المقالات',
      thisWeek: 'هذا الأسبوع',
      today: 'اليوم',
      countries: 'الدول',
      organizations: 'المنظمات',
      activity7Day: 'نشاط ٧ أيام',
      topRegions: 'أهم المناطق',
      trendingNow: 'الأكثر تداولاً',
      contentSentiment: 'تحليل المشاعر',
      negative: 'سلبي',
      neutral: 'محايد',
      positive: 'إيجابي',
    },
    // Footer
    footer: {
      about: 'حول',
      contact: 'اتصل بنا',
      privacy: 'الخصوصية',
      terms: 'الشروط',
      copyright: '© ٢٠٢٤ المُراقِب. جميع الحقوق محفوظة.',
      description: 'تحليل جيوسياسي مستقل وتغطية استخباراتية.',
    },
  },
};

export type Dictionary = typeof dictionaries.en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}
