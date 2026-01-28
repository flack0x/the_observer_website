import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, BookOpen, FileText } from 'lucide-react';
import { getDictionary, type Locale } from '@/lib/i18n';
import { getAllVoices } from '@/lib/voices';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return {
    title: `${dict.voices.title} | The Observer`,
    description: dict.voices.subtitle,
  };
}

export default async function VoicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);
  const isArabic = locale === 'ar';
  const voices = getAllVoices();

  return (
    <main className="min-h-screen bg-midnight-900">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 border-b border-midnight-700">
        <div className="absolute inset-0 bg-gradient-to-b from-tactical-red/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-light mb-4">
              {dict.voices.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-medium max-w-2xl mx-auto">
              {dict.voices.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Voices Grid */}
      <section className="py-12 sm:py-16" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {voices.length === 0 ? (
            <p className="text-center text-slate-medium">{dict.voices.noVoices}</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
              {voices.map((voice) => (
                <article
                  key={voice.slug}
                  className="group relative bg-midnight-800 rounded-2xl border border-midnight-700 overflow-hidden hover:border-tactical-red/50 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="lg:w-1/3 relative">
                      <div className="aspect-square lg:aspect-auto lg:h-full relative bg-midnight-700">
                        <Image
                          src={voice.avatar}
                          alt={isArabic && voice.nameAr ? voice.nameAr : voice.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight-900/80 via-transparent to-transparent lg:bg-gradient-to-r" />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:w-2/3 p-6 sm:p-8 flex flex-col justify-between">
                      <div>
                        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-light mb-2">
                          {isArabic && voice.nameAr ? voice.nameAr : voice.name}
                        </h2>
                        <p className="text-tactical-red font-medium mb-4">
                          {isArabic && voice.titleAr ? voice.titleAr : voice.title}
                        </p>
                        <p className="text-slate-medium line-clamp-3 mb-6">
                          {isArabic && voice.bioAr ? voice.bioAr.split('\n')[0] : voice.bio.split('\n')[0]}
                        </p>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4 mb-6">
                          <div className="flex items-center gap-2 text-sm text-slate-dark">
                            <FileText className="h-4 w-4 text-tactical-amber" />
                            <span>{voice.featuredArticles.length} {dict.voices.featuredArticles}</span>
                          </div>
                          {voice.books && voice.books.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-slate-dark">
                              <BookOpen className="h-4 w-4 text-earth-olive" />
                              <span>{voice.books.length} {dict.voices.books}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/${locale}/voices/${voice.slug}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-tactical-red hover:bg-tactical-red/90 text-white font-medium rounded-lg transition-colors"
                        >
                          {dict.voices.viewProfile}
                        </Link>
                        {voice.links.substack && (
                          <a
                            href={voice.links.substack}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-midnight-600 hover:border-tactical-red/50 text-slate-medium hover:text-slate-light rounded-lg transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {dict.voices.substack}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
