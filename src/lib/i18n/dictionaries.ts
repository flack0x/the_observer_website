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
      about: 'About',
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
    // Breaking news ticker fallback
    ticker: {
      live: 'Live',
      fallbackNews: [
        { category: 'BREAKING', title: 'Egypt-Israel $35B gas deal signals new economic dependency dynamics' },
        { category: 'POLITICAL', title: 'Regional powers reassess strategic alignments amid shifting alliances' },
        { category: 'MILITARY', title: 'New defense systems deployed across contested maritime zones' },
        { category: 'INTELLIGENCE', title: 'Covert operations exposed in declassified agency documents' },
        { category: 'ECONOMIC', title: 'Sanctions impact analysis reveals unexpected market adaptations' },
      ],
    },
    // About page
    about: {
      title: 'About The Observer',
      subtitle: 'Independent geopolitical intelligence',
      missionTitle: 'Our Mission',
      missionText: 'The Observer was founded with a singular purpose: to cut through the noise of mainstream media narratives and provide clear, factual, and contextualized intelligence on global conflicts and power dynamics. We believe that understanding geopolitics requires more than headlines—it demands deep analysis, historical context, and a commitment to truth over agenda.',
      whatWeDoTitle: 'What We Do',
      whatWeDoText: 'We monitor, analyze, and report on geopolitical developments across the Middle East, North Africa, and beyond. Our coverage spans military operations, diplomatic maneuvers, economic warfare, and intelligence activities that shape the world order.',
      principlesTitle: 'Our Principles',
      principle1Title: 'Independence',
      principle1Text: 'We operate without affiliation to any government, political party, or corporate interest. Our analysis is guided solely by facts and evidence.',
      principle2Title: 'Accuracy',
      principle2Text: 'Every claim we make is sourced and verified. We distinguish clearly between confirmed facts, credible reports, and analysis.',
      principle3Title: 'Context',
      principle3Text: 'We provide the historical and geopolitical context necessary to understand events, not just report them.',
      principle4Title: 'Transparency',
      principle4Text: 'We cite our sources and acknowledge when information is incomplete or uncertain.',
      whyItMattersTitle: 'Why It Matters',
      whyItMattersText: 'In an era of information warfare and manufactured narratives, access to independent, fact-based intelligence is not a luxury—it\'s a necessity. The Observer exists to serve those who refuse to accept the official story at face value and seek to understand the forces that truly shape our world.',
      joinUsTitle: 'Join the Network',
      joinUsText: 'Follow our Telegram channels for real-time updates and join a community of analysts, researchers, and truth-seekers dedicated to understanding geopolitical reality.',
      telegramEnglish: 'English Channel',
      telegramArabic: 'Arabic Channel',
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
      about: 'من نحن',
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
    // Breaking news ticker fallback
    ticker: {
      live: 'مباشر',
      fallbackNews: [
        { category: 'عاجل', title: 'صفقة غاز مصرية-إسرائيلية بـ35 مليار دولار تشير إلى ديناميكيات تبعية اقتصادية جديدة' },
        { category: 'سياسي', title: 'القوى الإقليمية تعيد تقييم توجهاتها الاستراتيجية وسط تحالفات متغيرة' },
        { category: 'عسكري', title: 'نشر أنظمة دفاعية جديدة عبر المناطق البحرية المتنازع عليها' },
        { category: 'استخباراتي', title: 'كشف عمليات سرية في وثائق رفعت عنها السرية' },
        { category: 'اقتصادي', title: 'تحليل تأثير العقوبات يكشف عن تكيفات غير متوقعة في السوق' },
      ],
    },
    // About page
    about: {
      title: 'عن المُراقِب',
      subtitle: 'استخبارات جيوسياسية مستقلة',
      missionTitle: 'مهمتنا',
      missionText: 'تأسس المُراقِب بهدف واحد: اختراق ضجيج الروايات الإعلامية السائدة وتقديم معلومات استخباراتية واضحة وموثقة ومُسيَّقة حول الصراعات العالمية وديناميكيات القوى. نؤمن بأن فهم الجيوسياسة يتطلب أكثر من العناوين الرئيسية—إنه يتطلب تحليلاً عميقاً، وسياقاً تاريخياً، والتزاماً بالحقيقة فوق أي أجندة.',
      whatWeDoTitle: 'ما نفعله',
      whatWeDoText: 'نراقب ونحلل ونُعِدّ التقارير حول التطورات الجيوسياسية في الشرق الأوسط وشمال أفريقيا وما وراءهما. تغطيتنا تشمل العمليات العسكرية، والمناورات الدبلوماسية، والحرب الاقتصادية، والأنشطة الاستخباراتية التي تشكّل النظام العالمي.',
      principlesTitle: 'مبادئنا',
      principle1Title: 'الاستقلالية',
      principle1Text: 'نعمل دون انتماء لأي حكومة أو حزب سياسي أو مصلحة تجارية. تحليلنا يسترشد فقط بالحقائق والأدلة.',
      principle2Title: 'الدقة',
      principle2Text: 'كل ادعاء نطرحه موثق ومُتحقق منه. نميّز بوضوح بين الحقائق المؤكدة والتقارير الموثوقة والتحليلات.',
      principle3Title: 'السياق',
      principle3Text: 'نقدم السياق التاريخي والجيوسياسي الضروري لفهم الأحداث، وليس مجرد نقلها.',
      principle4Title: 'الشفافية',
      principle4Text: 'نذكر مصادرنا ونعترف عندما تكون المعلومات ناقصة أو غير مؤكدة.',
      whyItMattersTitle: 'لماذا يهم',
      whyItMattersText: 'في عصر حروب المعلومات والروايات المُصنَّعة، الوصول إلى استخبارات مستقلة قائمة على الحقائق ليس ترفاً—بل ضرورة. المُراقِب موجود لخدمة أولئك الذين يرفضون قبول الرواية الرسمية ظاهرياً ويسعون لفهم القوى التي تشكّل عالمنا حقاً.',
      joinUsTitle: 'انضم إلى الشبكة',
      joinUsText: 'تابع قنواتنا على تيليجرام للتحديثات الفورية وانضم إلى مجتمع من المحللين والباحثين والباحثين عن الحقيقة الملتزمين بفهم الواقع الجيوسياسي.',
      telegramEnglish: 'القناة الإنجليزية',
      telegramArabic: 'القناة العربية',
    },
  },
};

export type Dictionary = typeof dictionaries.en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}
