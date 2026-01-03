import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import IntelDashboard from "@/components/sections/IntelDashboard";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  return {
    title: isArabic ? 'غرفة العمليات | المُراقِب' : 'Situation Room | The Observer',
    description: isArabic
      ? 'لوحة معلومات استخباراتية في الوقت الفعلي مع تحليلات ومقاييس'
      : 'Real-time intelligence dashboard with analytics and metrics',
  };
}

export default async function SituationRoomPage({ params }: Props) {
  const { locale } = await params;
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'en';
  const dict = await getDictionary(validLocale);
  const isArabic = validLocale === 'ar';

  return (
    <div className="min-h-screen bg-midnight-900">
      {/* Page Header */}
      <div className="border-b border-midnight-700 bg-midnight-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wider text-slate-light">
            {dict.nav.situationRoom}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-medium max-w-2xl">
            {isArabic
              ? 'لوحة معلومات استخباراتية في الوقت الفعلي. راقب الأنماط وحلل الاتجاهات وتتبع التطورات الجيوسياسية.'
              : 'Real-time intelligence dashboard. Monitor patterns, analyze trends, and track geopolitical developments.'}
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <IntelDashboard locale={validLocale} dict={dict} />
    </div>
  );
}
