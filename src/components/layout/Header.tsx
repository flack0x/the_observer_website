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
  LogIn,
  LogOut,
  User,
  Sun,
  Moon,
} from "lucide-react";
import BreakingNewsTicker from "@/components/ui/BreakingNewsTicker";
import type { Locale, Dictionary } from "@/lib/i18n";
import { getTelegramChannel } from "@/lib/config";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
  breakingNews: string[];
}

export default function Header({ locale, dict, breakingNews }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isRTL = locale === 'ar';
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: dict.nav.frontline, href: `/${locale}/frontline` },
    { name: dict.nav.situationRoom, href: `/${locale}/situation-room` },
    { name: dict.nav.books, href: `/${locale}/books` },
    { name: dict.nav.dossier, href: `/${locale}/dossier` },
    { name: dict.nav.chronicles, href: `/${locale}/chronicles` },
    { name: dict.nav.about, href: `/${locale}/about` },
  ];

  const switchLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    // Replace current locale in pathname with new locale
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  const telegramChannel = getTelegramChannel(locale);

  return (
    <header className="sticky top-0 z-50">
      {/* Breaking News Ticker */}
      <BreakingNewsTicker locale={locale} dict={dict} initialNews={breakingNews} />

      {/* Main Header */}
      <div className="bg-midnight-800 backdrop-blur-md border-b border-midnight-600">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 sm:-my-4 flex-shrink-0">
                <Image
                  src="/images/observer-silhouette.png"
                  alt="The Observer"
                  fill
                  className="object-contain opacity-90 group-hover:opacity-100 transition-opacity logo-gold"
                />
              </div>
              <div className="flex flex-col leading-none min-w-0">
                <span className="font-heading text-sm sm:text-lg font-bold tracking-wider text-slate-light truncate">
                  {dict.header.title}
                </span>
                <span className="hidden sm:block text-[10px] uppercase tracking-[0.15em] text-slate-dark">
                  {dict.header.subtitle}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative inline-flex items-center h-9 px-2.5 font-heading text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors ${
                      isActive
                        ? 'text-tactical-red'
                        : 'text-slate-medium hover:text-tactical-red'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-1 left-2.5 right-2.5 h-0.5 bg-tactical-red rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-midnight-500 text-slate-medium transition-all hover:border-tactical-red hover:text-tactical-red"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </button>

              {/* Language Toggle - Hidden on mobile, shown in mobile menu */}
              <button
                onClick={switchLanguage}
                aria-label={locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-midnight-500 px-2.5 py-1 font-heading text-[10px] font-medium uppercase tracking-wider text-slate-medium transition-all hover:border-tactical-red hover:text-tactical-red"
              >
                <Globe className="h-3 w-3" aria-hidden="true" />
                {locale === "en" ? "AR" : "EN"}
              </button>

              {/* Sign In/Out - Desktop */}
              {user ? (
                <button
                  onClick={() => signOut()}
                  className="hidden sm:flex items-center gap-1.5 rounded-full border border-midnight-500 px-2.5 py-1 font-heading text-[10px] font-medium uppercase tracking-wider text-slate-medium transition-all hover:border-tactical-red hover:text-tactical-red"
                >
                  <LogOut className="h-3 w-3" aria-hidden="true" />
                  {locale === "en" ? "Sign Out" : "خروج"}
                </button>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="hidden sm:flex items-center gap-1.5 rounded-full border border-midnight-500 px-2.5 py-1 font-heading text-[10px] font-medium uppercase tracking-wider text-slate-medium transition-all hover:border-tactical-red hover:text-tactical-red"
                >
                  <LogIn className="h-3 w-3" aria-hidden="true" />
                  {locale === "en" ? "Sign In" : "تسجيل"}
                </Link>
              )}

              {/* Telegram CTA - Desktop only */}
              <a
                href={telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 rounded-full bg-tactical-red px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover"
              >
                <Send className="h-3 w-3" aria-hidden="true" />
                {dict.nav.joinIntel}
              </a>

              {/* Mobile menu button - Always visible on mobile */}
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-white bg-tactical-red hover:bg-tactical-red-hover transition-colors"
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
              {/* Navigation Links */}
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center rounded-lg px-4 py-3 font-heading text-sm font-medium uppercase tracking-wider transition-colors ${
                        isActive
                          ? 'bg-tactical-red/10 text-tactical-red border-l-2 border-tactical-red'
                          : 'text-slate-light hover:bg-midnight-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Theme & Language Toggles */}
              <div className="mt-4 pt-4 border-t border-midnight-700 space-y-1">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full rounded-lg px-4 py-3 text-slate-light hover:bg-midnight-700 transition-colors"
                >
                  <span className="font-heading text-sm font-medium uppercase tracking-wider">
                    {resolvedTheme === 'dark'
                      ? (locale === "en" ? "Light Mode" : "الوضع الفاتح")
                      : (locale === "en" ? "Dark Mode" : "الوضع الداكن")}
                  </span>
                  <span className="flex items-center gap-2 text-tactical-red">
                    {resolvedTheme === 'dark' ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </span>
                </button>

                {/* Language Toggle */}
                <button
                  onClick={() => {
                    switchLanguage();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full rounded-lg px-4 py-3 text-slate-light hover:bg-midnight-700 transition-colors"
                >
                  <span className="font-heading text-sm font-medium uppercase tracking-wider">
                    {locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
                  </span>
                  <span className="flex items-center gap-2 text-tactical-red">
                    <Globe className="h-4 w-4" />
                    {locale === "en" ? "العربية" : "English"}
                  </span>
                </button>
              </div>

              {/* Sign In/Out - Mobile */}
              <div className="mt-4 pt-4 border-t border-midnight-700">
                {user ? (
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full rounded-lg px-4 py-3 text-slate-light hover:bg-midnight-700 transition-colors"
                  >
                    <span className="font-heading text-sm font-medium uppercase tracking-wider">
                      {locale === "en" ? "Sign Out" : "تسجيل الخروج"}
                    </span>
                    <span className="flex items-center gap-2 text-tactical-red">
                      <LogOut className="h-4 w-4" />
                    </span>
                  </button>
                ) : (
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between w-full rounded-lg px-4 py-3 text-slate-light hover:bg-midnight-700 transition-colors"
                  >
                    <span className="font-heading text-sm font-medium uppercase tracking-wider">
                      {locale === "en" ? "Sign In" : "تسجيل الدخول"}
                    </span>
                    <span className="flex items-center gap-2 text-tactical-red">
                      <LogIn className="h-4 w-4" />
                    </span>
                  </Link>
                )}
              </div>

              {/* Telegram CTA */}
              <div className="mt-4 pt-4 border-t border-midnight-700">
                <a
                  href={telegramChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-tactical-red px-4 py-3 font-heading text-sm font-bold uppercase tracking-wider text-white hover:bg-tactical-red-hover transition-colors"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
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
