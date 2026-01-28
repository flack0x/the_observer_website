// External Voices - Featured authors and analysts
// This file contains static data for external contributors featured on the site

export interface FeaturedArticle {
  title: string;
  url: string;
  description?: string;
}

export interface FeaturedBook {
  title: string;
  url?: string;
  coverImage?: string;
}

export interface ExternalVoice {
  slug: string;
  name: string;
  nameAr?: string;
  title: string;
  titleAr?: string;
  avatar: string;
  bio: string;
  bioAr?: string;
  credentials: string[];
  credentialsAr?: string[];
  links: {
    substack?: string;
    twitter?: string;
    website?: string;
    amazon?: string;
  };
  featuredArticles: FeaturedArticle[];
  books?: FeaturedBook[];
}

export const EXTERNAL_VOICES: ExternalVoice[] = [
  {
    slug: 'j-michael-springmann',
    name: 'J. Michael Springmann',
    nameAr: 'ج. مايكل سبرينغمان',
    title: 'Former US Diplomat & Author',
    titleAr: 'دبلوماسي أمريكي سابق ومؤلف',
    avatar: 'https://m.media-amazon.com/images/S/amzn-author-media-prod/il0b7m09cji3ahdcp83rvt8urv._SX300_CR0%2C0%2C300%2C300_.jpg',
    bio: `J. Michael Springmann served in the United States government at the Commerce Department and as a diplomat with the State Department's Foreign Service, with postings in Germany, India, and Saudi Arabia. His last assignment was with the Bureau of Intelligence and Research.

He was the head of the American visa bureau in Jeddah, Saudi Arabia, from 1987 to 1989. He left federal service and currently practices law in the Washington, DC area.

Springmann holds a JD from American University, as well as undergraduate and graduate degrees in international relations from Georgetown University and the Catholic University of America. In 2004, the American-Arab Anti-Discrimination Committee recognized him as one of its Pro Bono Attorneys of the Year.

He has been published in numerous foreign policy publications, including Covert Action Quarterly, Global Research, Foreign Policy Journal, and OpEdNews.`,
    bioAr: `خدم ج. مايكل سبرينغمان في الحكومة الأمريكية في وزارة التجارة وكدبلوماسي في الخدمة الخارجية بوزارة الخارجية، مع مهام في ألمانيا والهند والمملكة العربية السعودية. كانت مهمته الأخيرة مع مكتب الاستخبارات والبحوث.

كان رئيس مكتب التأشيرات الأمريكي في جدة، المملكة العربية السعودية، من 1987 إلى 1989. ترك الخدمة الفيدرالية ويمارس حالياً المحاماة في منطقة واشنطن العاصمة.

يحمل سبرينغمان شهادة الدكتوراه في القانون من الجامعة الأمريكية، بالإضافة إلى درجات جامعية ودراسات عليا في العلاقات الدولية من جامعة جورجتاون والجامعة الكاثوليكية الأمريكية. في عام 2004، كرّمته اللجنة الأمريكية العربية لمكافحة التمييز كأحد محاميي العمل الخيري للعام.

نُشرت أعماله في العديد من منشورات السياسة الخارجية، بما في ذلك Covert Action Quarterly و Global Research و Foreign Policy Journal و OpEdNews.`,
    credentials: [
      'State Department Foreign Service (Germany, India, Saudi Arabia)',
      'Head of US Visa Bureau, Jeddah (1987-1989)',
      'Bureau of Intelligence and Research',
      'JD, American University',
      'MA International Relations, Georgetown University',
      'Pro Bono Attorney of the Year, ADC (2004)',
    ],
    credentialsAr: [
      'الخدمة الخارجية بوزارة الخارجية (ألمانيا، الهند، السعودية)',
      'رئيس مكتب التأشيرات الأمريكي، جدة (1987-1989)',
      'مكتب الاستخبارات والبحوث',
      'دكتوراه في القانون، الجامعة الأمريكية',
      'ماجستير علاقات دولية، جامعة جورجتاون',
      'محامي العمل الخيري للعام، ADC (2004)',
    ],
    links: {
      substack: 'https://jmichaelspringmann.substack.com',
      website: 'https://michaelspringmann.com',
      amazon: 'https://www.amazon.com/stores/author/B00UUKN6GU',
    },
    featuredArticles: [
      {
        title: 'Israel: America\'s Oldest Enemy',
        url: 'https://jmichaelspringmann.substack.com/p/israel-americas-oldest-enemy-491',
      },
      {
        title: 'Will Israel Turn Out Iran\'s Lights?',
        url: 'https://jmichaelspringmann.substack.com/p/will-israel-turn-out-irans-lights',
      },
      {
        title: 'The Islamic Republic Strikes Back',
        url: 'https://jmichaelspringmann.substack.com/p/the-islamic-republic-strikes-back',
      },
      {
        title: 'Zionist Propaganda Uber Alles',
        url: 'https://jmichaelspringmann.substack.com/p/zionist-propaganda-uber-alles',
      },
      {
        title: 'Who\'s Running Russia?',
        url: 'https://jmichaelspringmann.substack.com/p/whos-running-russia',
      },
      {
        title: 'The End of the War?',
        url: 'https://jmichaelspringmann.substack.com/p/the-end-of-the-war',
      },
      {
        title: 'Code Pink',
        url: 'https://jmichaelspringmann.substack.com/p/code-pink',
      },
      {
        title: 'It\'s All About the Benjamins',
        url: 'https://jmichaelspringmann.substack.com/p/its-all-sabout-the-benjamins',
      },
      {
        title: 'Zionism',
        url: 'https://jmichaelspringmann.substack.com/p/zionism',
      },
      {
        title: 'Zionist Puppets',
        url: 'https://jmichaelspringmann.substack.com/p/zionist-puppets',
      },
    ],
    books: [
      {
        title: 'Visas for Al Qaeda: CIA Handouts That Rocked the World',
        url: 'https://www.amazon.com/Visas-Al-Qaeda-Handouts-Insiders/dp/0990926206',
      },
      {
        title: 'Goodbye, Europe? Hello, Chaos?: Merkel\'s Migrant Bomb',
        url: 'https://www.amazon.com/stores/author/B00UUKN6GU',
      },
    ],
  },
];

// Get all voices
export function getAllVoices(): ExternalVoice[] {
  return EXTERNAL_VOICES;
}

// Get a single voice by slug
export function getVoiceBySlug(slug: string): ExternalVoice | undefined {
  return EXTERNAL_VOICES.find(voice => voice.slug === slug);
}

// Get featured voices for homepage (limit to first N)
export function getFeaturedVoices(limit: number = 3): ExternalVoice[] {
  return EXTERNAL_VOICES.slice(0, limit);
}
