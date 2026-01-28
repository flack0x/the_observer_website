"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, FileText, BookOpen } from "lucide-react";
import type { Locale, Dictionary } from "@/lib/i18n";
import { getFeaturedVoices } from "@/lib/voices";

interface FeaturedVoicesProps {
  locale: Locale;
  dict: Dictionary;
}

export default function FeaturedVoices({ locale, dict }: FeaturedVoicesProps) {
  const isArabic = locale === "ar";
  const voices = getFeaturedVoices(3);

  if (voices.length === 0) return null;

  return (
    <section
      className="relative py-16 sm:py-24 bg-midnight-900"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-tactical-red/5 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-px bg-tactical-red" />
            <span className="font-heading text-xs font-semibold uppercase tracking-wider text-tactical-red">
              {dict.voices.featuredVoices}
            </span>
            <span className="w-8 h-px bg-tactical-red" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-light mb-4">
            {dict.voices.title}
          </h2>
          <p className="text-slate-medium max-w-2xl mx-auto">
            {dict.voices.featuredVoicesSubtitle}
          </p>
        </motion.div>

        {/* Voices Grid */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 max-w-4xl mx-auto">
          {voices.map((voice, index) => (
            <motion.article
              key={voice.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-midnight-800 rounded-2xl border border-midnight-700 overflow-hidden hover:border-tactical-red/50 transition-all duration-300"
            >
              <div className={`flex flex-col sm:flex-row ${isArabic ? "sm:flex-row-reverse" : ""}`}>
                {/* Image */}
                <div className="sm:w-1/3 relative">
                  <div className="aspect-square sm:aspect-auto sm:h-full relative bg-midnight-700">
                    <Image
                      src={voice.avatar}
                      alt={isArabic && voice.nameAr ? voice.nameAr : voice.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-midnight-800/90 via-midnight-800/50 to-transparent" />
                  </div>
                </div>

                {/* Content */}
                <div className="sm:w-2/3 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-slate-light mb-1">
                      {isArabic && voice.nameAr ? voice.nameAr : voice.name}
                    </h3>
                    <p className="text-tactical-red text-sm font-medium mb-3">
                      {isArabic && voice.titleAr ? voice.titleAr : voice.title}
                    </p>
                    <p className="text-slate-medium text-sm line-clamp-2 mb-4">
                      {isArabic && voice.bioAr
                        ? voice.bioAr.split("\n")[0]
                        : voice.bio.split("\n")[0]}
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-dark">
                        <FileText className="h-3.5 w-3.5 text-tactical-amber" />
                        <span>
                          {voice.featuredArticles.length} {dict.voices.featuredArticles}
                        </span>
                      </div>
                      {voice.books && voice.books.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-dark">
                          <BookOpen className="h-3.5 w-3.5 text-earth-olive" />
                          <span>
                            {voice.books.length} {dict.voices.books}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/${locale}/voices/${voice.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-tactical-red hover:bg-tactical-red/90 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {dict.voices.viewProfile}
                      <ArrowRight className={`h-3.5 w-3.5 ${isArabic ? "rotate-180" : ""}`} />
                    </Link>
                    {voice.links.substack && (
                      <a
                        href={voice.links.substack}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-midnight-600 hover:border-tactical-red/50 text-slate-medium hover:text-slate-light text-sm rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {dict.voices.readArticles}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link
            href={`/${locale}/voices`}
            className="inline-flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wider text-tactical-red hover:text-tactical-red/80 transition-colors"
          >
            {dict.voices.exploreWritings}
            <ArrowRight className={`h-4 w-4 ${isArabic ? "rotate-180" : ""}`} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
