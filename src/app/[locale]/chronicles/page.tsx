import { Metadata } from "next";
import { getDictionary, type Locale, locales } from "@/lib/i18n";
import { Clock, Lock } from "lucide-react";
import Link from "next/link";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  return {
    title: isArabic ? 'السجلات | المُراقِب' : 'Chronicles | The Observer',
    description: isArabic
      ? 'الخط الزمني التاريخي للأحداث الجيوسياسية الرئيسية'
      : 'Historical timeline of key geopolitical events',
  };
}

export default async function ChroniclesPage({ params }: Props) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  const dict = getDictionary(validLocale);
  const isArabic = validLocale === 'ar';

  return (
    <div className="min-h-screen bg-midnight-900" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <section className="border-b border-midnight-700 bg-midnight-800 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tactical-amber/10 border border-tactical-amber/20 mb-6">
            <Clock className="h-4 w-4 text-tactical-amber" />
            <span className="text-xs font-heading font-medium uppercase tracking-wider text-tactical-amber">
              {isArabic ? 'قريباً' : 'Coming Soon'}
            </span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wider text-slate-light mb-6">
            {dict.nav.chronicles}
          </h1>
          <p className="text-lg text-slate-medium leading-relaxed max-w-2xl mx-auto">
            {isArabic
              ? 'خط زمني تفاعلي للأحداث التاريخية الرئيسية - من الحروب والمعاهدات إلى التحولات الجيوسياسية التي شكلت عالمنا.'
              : 'An interactive timeline of key historical events — from wars and treaties to the geopolitical shifts that shaped our world.'}
          </p>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-midnight-800 rounded-2xl border border-midnight-700 p-8 sm:p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-midnight-700 mx-auto mb-6">
              <Lock className="h-8 w-8 text-slate-dark" />
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-light mb-4">
              {isArabic ? 'قيد التطوير' : 'Under Development'}
            </h2>
            <p className="text-slate-medium mb-8 max-w-md mx-auto">
              {isArabic
                ? 'نعمل على بناء خط زمني تفاعلي شامل. تابعنا للتحديثات.'
                : 'We are building a comprehensive interactive timeline. Follow us for updates.'}
            </p>
            <Link
              href={`/${validLocale}/frontline`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-tactical-red text-white rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-tactical-red-hover transition-colors"
            >
              {isArabic ? 'استكشف الجبهة' : 'Explore The Frontline'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
