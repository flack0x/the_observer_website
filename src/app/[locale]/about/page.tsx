import { Metadata } from "next";
import Image from "next/image";
import { getDictionary, type Locale, locales } from "@/lib/i18n";
import { Eye, Target, Shield, BookOpen } from "lucide-react";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return {
    title: dict.about.title,
    description: dict.about.missionText.slice(0, 160),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  const dict = getDictionary(validLocale);
  const isArabic = validLocale === 'ar';

  const principles = [
    {
      icon: Shield,
      title: dict.about.principle1Title,
      text: dict.about.principle1Text,
    },
    {
      icon: Target,
      title: dict.about.principle2Title,
      text: dict.about.principle2Text,
    },
    {
      icon: BookOpen,
      title: dict.about.principle3Title,
      text: dict.about.principle3Text,
    },
    {
      icon: Eye,
      title: dict.about.principle4Title,
      text: dict.about.principle4Text,
    },
  ];

  return (
    <div className="min-h-screen bg-midnight-900" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="border-b border-midnight-700 bg-midnight-800 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Brand Symbol */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6">
            <Image
              src="/images/observer-silhouette.png"
              alt="The Observer"
              fill
              className="object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tactical-red/10 border border-tactical-red/20 mb-6">
            <Eye className="h-4 w-4 text-tactical-red" />
            <span className="text-xs font-heading font-medium uppercase tracking-wider text-tactical-red">
              {dict.about.subtitle}
            </span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wider text-slate-light mb-6">
            {dict.about.title}
          </h1>
          <p className="text-lg text-slate-medium leading-relaxed max-w-2xl mx-auto">
            {dict.about.missionText}
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-light mb-6">
            {dict.about.whatWeDoTitle}
          </h2>
          <p className="text-slate-medium leading-relaxed text-lg">
            {dict.about.whatWeDoText}
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 sm:py-20 bg-midnight-800 border-y border-midnight-700">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-light mb-12 text-center">
            {dict.about.principlesTitle}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {principles.map((principle, index) => (
              <div
                key={index}
                className="bg-midnight-900 rounded-xl p-6 sm:p-8 border border-midnight-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-tactical-red/10">
                    <principle.icon className="h-6 w-6 text-tactical-red" />
                  </div>
                  <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-slate-light">
                    {principle.title}
                  </h3>
                </div>
                <p className="text-slate-medium leading-relaxed">
                  {principle.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-light mb-6">
            {dict.about.whyItMattersTitle}
          </h2>
          <p className="text-slate-medium leading-relaxed text-lg">
            {dict.about.whyItMattersText}
          </p>
        </div>
      </section>

    </div>
  );
}
