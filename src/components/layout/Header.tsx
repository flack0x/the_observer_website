"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Globe,
  Send,
} from "lucide-react";
import BreakingNewsTicker from "@/components/ui/BreakingNewsTicker";
import type { Locale, Dictionary } from "@/lib/i18n";

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
}

export default function Header({ locale, dict }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isRTL = locale === 'ar';

  const navigation = [
    { name: dict.nav.frontline, href: `/${locale}/frontline` },
    { name: dict.nav.situationRoom, href: `/${locale}/situation-room` },
    { name: dict.nav.about, href: `/${locale}/about` },
  ];

  const switchLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    // Replace current locale in pathname with new locale
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  const telegramChannel = locale === 'ar' ? 'https://t.me/almuraqb' : 'https://t.me/observer_5';

  return (
    <header className="sticky top-0 z-50">
      {/* Breaking News Ticker */}
      <BreakingNewsTicker locale={locale} dict={dict} />

      {/* Main Header */}
      <div className="bg-midnight-800 backdrop-blur-md border-b border-midnight-600">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-3 group shrink-0">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/images/observer-silhouette.png"
                  alt="The Observer"
                  fill
                  className="object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading text-base font-bold tracking-wider text-slate-light">
                  {dict.header.title}
                </span>
                <span className="text-[8px] uppercase tracking-[0.15em] text-slate-dark">
                  {dict.header.subtitle}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center h-9 px-3 font-heading text-[11px] font-semibold uppercase tracking-wider text-slate-medium transition-colors hover:text-tactical-red"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Language Toggle */}
              <button
                onClick={switchLanguage}
                aria-label={locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
                className="flex items-center gap-1.5 rounded-full border border-midnight-500 px-2.5 py-1 font-heading text-[10px] font-medium uppercase tracking-wider text-slate-medium transition-all hover:border-tactical-red hover:text-tactical-red"
              >
                <Globe className="h-3 w-3" />
                {locale === "en" ? "AR" : "EN"}
              </button>

              {/* Telegram CTA */}
              <a
                href={telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-full bg-tactical-red px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover sm:flex"
              >
                <Send className="h-3 w-3" />
                {dict.nav.joinIntel}
              </a>

              {/* Mobile menu button */}
              <button
                className="lg:hidden rounded-md p-1.5 text-slate-medium hover:bg-midnight-700 hover:text-slate-light"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen
                  ? (locale === "en" ? "Close menu" : "إغلاق القائمة")
                  : (locale === "en" ? "Open menu" : "فتح القائمة")}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-midnight-600 bg-midnight-800"
          >
            <div className="px-4 py-4">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center rounded-md px-3 py-3 font-heading text-sm font-medium uppercase tracking-wider text-slate-medium hover:bg-midnight-700 hover:text-tactical-red transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-midnight-700">
                <a
                  href={telegramChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-tactical-red px-4 py-3 font-heading text-sm font-bold uppercase tracking-wider text-white hover:bg-tactical-red-hover transition-colors"
                >
                  <Send className="h-4 w-4" />
                  {dict.nav.joinIntel}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
