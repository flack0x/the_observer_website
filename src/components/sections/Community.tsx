"use client";

import { motion } from "framer-motion";
import { Send, MessageCircle, Mail, Users, ArrowRight, Globe } from "lucide-react";
import type { Locale, Dictionary } from "@/lib/i18n";
import { getTelegramChannel, TELEGRAM_CHANNELS, CONTACT_EMAIL } from "@/lib/config";

interface CommunityProps {
  locale: Locale;
  dict: Dictionary;
}

// Static color mappings for Tailwind (dynamic classes don't work)
const colorStyles = {
  'tactical-red': 'bg-tactical-red/10 text-tactical-red',
  'tactical-amber': 'bg-tactical-amber/10 text-tactical-amber',
  'earth-olive': 'bg-earth-olive/10 text-earth-olive',
} as const;

type ColorKey = keyof typeof colorStyles;

export default function Community({ locale, dict }: CommunityProps) {
  const isArabic = locale === 'ar';

  const discussions: { topic: string; activity: string; color: ColorKey }[] = [
    { topic: dict.community.topic1, activity: dict.community.veryActive, color: "tactical-red" },
    { topic: dict.community.topic2, activity: dict.community.active, color: "tactical-amber" },
    { topic: dict.community.topic3, activity: dict.community.trending, color: "earth-olive" },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-midnight-900" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-midnight-800 border border-midnight-600 mb-4">
            <Users className="h-4 w-4 text-tactical-amber" aria-hidden="true" />
            <span className="text-xs font-heading font-medium uppercase tracking-wider text-slate-medium">
              {dict.community.joinNetwork}
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-light mb-3">
            {dict.community.bePartOfConversation}
          </h2>
          <p className="text-slate-medium max-w-2xl mx-auto">
            {dict.community.description}
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Telegram English */}
          <motion.a
            href={TELEGRAM_CHANNELS.en}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="group bg-midnight-800 rounded-xl p-6 border border-midnight-700 hover:border-tactical-red/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-tactical-red/10">
                <Send className="h-6 w-6 text-tactical-red" aria-hidden="true" />
              </div>
              <ArrowRight className={`h-5 w-5 text-slate-dark group-hover:text-tactical-red transition-all ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} aria-hidden="true" />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-light mb-2">
              {dict.community.telegramEnglish}
            </h3>
            <p className="text-sm text-slate-medium mb-4">
              {dict.community.telegramEnglishDesc}
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-dark">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>{dict.community.membersEnglish}</span>
            </div>
          </motion.a>

          {/* Telegram Arabic */}
          <motion.a
            href={TELEGRAM_CHANNELS.ar}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group bg-midnight-800 rounded-xl p-6 border border-midnight-700 hover:border-tactical-amber/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-tactical-amber/10">
                <Globe className="h-6 w-6 text-tactical-amber" aria-hidden="true" />
              </div>
              <ArrowRight className={`h-5 w-5 text-slate-dark group-hover:text-tactical-amber transition-all ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} aria-hidden="true" />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-light mb-2">
              {dict.community.telegramArabic}
            </h3>
            <p className="text-sm text-slate-medium mb-4">
              {dict.community.telegramArabicDesc}
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-dark">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>{dict.community.membersArabic}</span>
            </div>
          </motion.a>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-midnight-800 rounded-xl p-6 border border-midnight-700 sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-earth-olive/10">
                <Mail className="h-6 w-6 text-earth-olive" aria-hidden="true" />
              </div>
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-light mb-2">
              {dict.community.contactUs}
            </h3>
            <p className="text-sm text-slate-medium mb-4">
              {dict.community.contactDesc}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-wider text-earth-olive hover:text-tactical-amber transition-colors"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
          </motion.div>
        </div>

        {/* Discussion Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 sm:mt-12 bg-midnight-800 rounded-xl p-6 sm:p-8 border border-midnight-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="h-5 w-5 text-tactical-red" aria-hidden="true" />
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
              {dict.community.communityPulse}
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {discussions.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-midnight-900 border border-midnight-700"
              >
                <span className="text-sm text-slate-light font-medium">
                  {item.topic}
                </span>
                <span className={`text-xs font-heading font-medium uppercase px-2 py-1 rounded-full ${colorStyles[item.color]}`}>
                  {item.activity}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-midnight-700 text-center">
            <a
              href={getTelegramChannel(locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tactical-red text-white font-heading text-sm font-bold uppercase tracking-wider hover:bg-tactical-red-hover transition-colors"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {dict.community.joinDiscussion}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
