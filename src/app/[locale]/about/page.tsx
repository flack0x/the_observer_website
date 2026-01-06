import { Metadata } from "next";
import Image from "next/image";
import { getDictionary, type Locale, locales } from "@/lib/i18n";
import { Eye, Target, Shield, BookOpen, CheckCircle, AlertCircle, Globe, Crosshair, Scale, DollarSign, Search, Users, ArrowRight, Send } from "lucide-react";

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

      {/* Editorial Standards */}
      <section className="py-16 sm:py-20 bg-midnight-800 border-y border-midnight-700">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-light mb-4">
              {dict.about.editorialTitle}
            </h2>
            <p className="text-slate-medium leading-relaxed max-w-2xl mx-auto">
              {dict.about.editorialText}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="bg-midnight-900 rounded-xl p-6 border border-midnight-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-earth-olive/10">
                  <CheckCircle className="h-5 w-5 text-earth-olive" />
                </div>
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                  {dict.about.sourceVerification}
                </h3>
              </div>
              <p className="text-sm text-slate-medium leading-relaxed">
                {dict.about.sourceVerificationText}
              </p>
            </div>
            <div className="bg-midnight-900 rounded-xl p-6 border border-midnight-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tactical-amber/10">
                  <Scale className="h-5 w-5 text-tactical-amber" />
                </div>
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                  {dict.about.factVsAnalysis}
                </h3>
              </div>
              <p className="text-sm text-slate-medium leading-relaxed">
                {dict.about.factVsAnalysisText}
              </p>
            </div>
            <div className="bg-midnight-900 rounded-xl p-6 border border-midnight-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tactical-red/10">
                  <AlertCircle className="h-5 w-5 text-tactical-red" />
                </div>
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                  {dict.about.corrections}
                </h3>
              </div>
              <p className="text-sm text-slate-medium leading-relaxed">
                {dict.about.correctionsText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Focus */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-light mb-6">
            {dict.about.coverageTitle}
          </h2>
          <p className="text-slate-medium leading-relaxed text-lg mb-8">
            {dict.about.coverageText}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Crosshair, text: dict.about.coverageItem1 },
              { icon: Users, text: dict.about.coverageItem2 },
              { icon: DollarSign, text: dict.about.coverageItem3 },
              { icon: Search, text: dict.about.coverageItem4 },
              { icon: Globe, text: dict.about.coverageItem5 },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg border border-midnight-700 bg-midnight-800"
              >
                <item.icon className="h-5 w-5 text-tactical-red flex-shrink-0" />
                <span className="text-slate-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Network */}
      <section className="py-16 sm:py-20 bg-midnight-800 border-t border-midnight-700">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tactical-red/10 border border-tactical-red/20 mb-6">
            <Send className="h-4 w-4 text-tactical-red" />
            <span className="text-xs font-heading font-medium uppercase tracking-wider text-tactical-red">
              Telegram
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-light mb-4">
            {dict.about.joinUsTitle}
          </h2>
          <p className="text-slate-medium leading-relaxed max-w-2xl mx-auto mb-10">
            {dict.about.joinUsText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://t.me/observer_5"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-midnight-600 bg-midnight-900 hover:border-tactical-red transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tactical-red/10">
                <Send className="h-5 w-5 text-tactical-red" />
              </div>
              <div className={isArabic ? 'text-right' : 'text-left'}>
                <div className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                  {dict.about.telegramEnglish}
                </div>
                <div className="text-xs text-slate-dark">@observer_5</div>
              </div>
              <ArrowRight className={`h-4 w-4 text-slate-dark group-hover:text-tactical-red transition-colors ${isArabic ? 'rotate-180' : ''}`} />
            </a>
            <a
              href="https://t.me/almuraqb"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-midnight-600 bg-midnight-900 hover:border-tactical-red transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tactical-red/10">
                <Send className="h-5 w-5 text-tactical-red" />
              </div>
              <div className={isArabic ? 'text-right' : 'text-left'}>
                <div className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                  {dict.about.telegramArabic}
                </div>
                <div className="text-xs text-slate-dark">@almuraqb</div>
              </div>
              <ArrowRight className={`h-4 w-4 text-slate-dark group-hover:text-tactical-red transition-colors ${isArabic ? 'rotate-180' : ''}`} />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
