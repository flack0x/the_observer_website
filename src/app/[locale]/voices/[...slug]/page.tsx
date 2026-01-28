import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, BookOpen, Award, Globe, ShoppingBag } from 'lucide-react';
import { getDictionary, type Locale } from '@/lib/i18n';
import { getVoiceBySlug, getAllVoices } from '@/lib/voices';

export function generateStaticParams() {
  const voices = getAllVoices();
  const params: { locale: string; slug: string[] }[] = [];

  for (const voice of voices) {
    params.push({ locale: 'en', slug: [voice.slug] });
    params.push({ locale: 'ar', slug: [voice.slug] });
  }

  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string[] }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const voiceSlug = slug[0];
  const voice = getVoiceBySlug(voiceSlug);

  if (!voice) {
    return { title: 'Not Found' };
  }

  const name = locale === 'ar' && voice.nameAr ? voice.nameAr : voice.name;
  const title = locale === 'ar' && voice.titleAr ? voice.titleAr : voice.title;

  return {
    title: `${name} | The Observer`,
    description: `${title} - ${voice.bio.substring(0, 150)}...`,
    openGraph: {
      title: name,
      description: title,
      images: [{ url: voice.avatar }],
    },
  };
}

export default async function VoiceDetailPage({ params }: { params: Promise<{ locale: string; slug: string[] }> }) {
  const { locale, slug } = await params;
  const voiceSlug = slug[0];
  const dict = getDictionary(locale as Locale);
  const isArabic = locale === 'ar';
  const voice = getVoiceBySlug(voiceSlug);

  if (!voice) {
    notFound();
  }

  const name = isArabic && voice.nameAr ? voice.nameAr : voice.name;
  const title = isArabic && voice.titleAr ? voice.titleAr : voice.title;
  const bio = isArabic && voice.bioAr ? voice.bioAr : voice.bio;
  const credentials = isArabic && voice.credentialsAr ? voice.credentialsAr : voice.credentials;

  return (
    <main className="min-h-screen bg-midnight-900">
      {/* Back Navigation */}
      <div className="bg-midnight-800 border-b border-midnight-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/${locale}/voices`}
            className={`inline-flex items-center gap-2 text-slate-medium hover:text-tactical-red transition-colors ${isArabic ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
            <span className="text-sm font-heading uppercase tracking-wider">{dict.voices.backToVoices}</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 border-b border-midnight-700" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="absolute inset-0 bg-gradient-to-b from-tactical-red/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col lg:flex-row gap-8 items-center ${isArabic ? 'lg:flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-tactical-red/30 flex-shrink-0">
              <Image
                src={voice.avatar}
                alt={name}
                fill
                className="object-cover"
                sizes="256px"
                priority
              />
            </div>

            {/* Info */}
            <div className={`flex-1 text-center lg:text-${isArabic ? 'right' : 'left'}`}>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-light mb-2">
                {name}
              </h1>
              <p className="text-xl text-tactical-red font-medium mb-6">
                {title}
              </p>

              {/* External Links */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {voice.links.substack && (
                  <a
                    href={voice.links.substack}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {dict.voices.substack}
                  </a>
                )}
                {voice.links.website && (
                  <a
                    href={voice.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-midnight-600 hover:border-tactical-red/50 text-slate-medium hover:text-slate-light rounded-lg transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    {dict.voices.website}
                  </a>
                )}
                {voice.links.amazon && (
                  <a
                    href={voice.links.amazon}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-midnight-600 hover:border-tactical-red/50 text-slate-medium hover:text-slate-light rounded-lg transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {dict.voices.amazon}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio */}
              <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-6 sm:p-8">
                <h2 className="font-heading text-xl font-bold text-slate-light mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-tactical-red rounded-full" />
                  About
                </h2>
                <div className="prose prose-invert max-w-none">
                  {bio.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-slate-medium leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Featured Articles */}
              <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-6 sm:p-8">
                <h2 className="font-heading text-xl font-bold text-slate-light mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-tactical-amber rounded-full" />
                  {dict.voices.featuredArticles}
                </h2>
                <div className="space-y-4">
                  {voice.featuredArticles.map((article, index) => (
                    <a
                      key={index}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-4 p-4 rounded-lg bg-midnight-700/50 hover:bg-midnight-700 border border-transparent hover:border-tactical-red/30 transition-all"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-tactical-red/10 text-tactical-red flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-light group-hover:text-tactical-red transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        {article.description && (
                          <p className="text-sm text-slate-dark mt-1 line-clamp-2">{article.description}</p>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-dark group-hover:text-tactical-red transition-colors flex-shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Credentials */}
              <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-6">
                <h2 className="font-heading text-lg font-bold text-slate-light mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-tactical-amber" />
                  {dict.voices.credentials}
                </h2>
                <ul className="space-y-3">
                  {credentials.map((credential, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-tactical-red mt-2 flex-shrink-0" />
                      {credential}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Books */}
              {voice.books && voice.books.length > 0 && (
                <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-6">
                  <h2 className="font-heading text-lg font-bold text-slate-light mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-earth-olive" />
                    {dict.voices.books}
                  </h2>
                  <div className="space-y-3">
                    {voice.books.map((book, index) => (
                      <a
                        key={index}
                        href={book.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block p-3 rounded-lg bg-midnight-700/50 hover:bg-midnight-700 border border-transparent hover:border-earth-olive/30 transition-all"
                      >
                        <h3 className="font-medium text-slate-light group-hover:text-earth-olive transition-colors text-sm">
                          {book.title}
                        </h3>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
