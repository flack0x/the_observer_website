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
  ChevronDown,
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isRTL = locale === 'ar';

  const navigation = [
    { name: dict.nav.frontline, href: `/${locale}/frontline`, description: dict.navDesc.frontline },
    { name: dict.nav.deepDives, href: `/${locale}/analysis`, description: dict.navDesc.deepDives },
    {
      name: dict.nav.intelligence,
      href: "#",
      children: [
        { name: dict.nav.situationRoom, href: `/${locale}/situation-room`, description: dict.navDesc.situationRoom },
        { name: dict.nav.dossier, href: `/${locale}/dossier`, description: dict.navDesc.dossier },
        { name: dict.nav.arsenal, href: `/${locale}/arsenal`, description: dict.navDesc.arsenal },
        { name: dict.nav.sources, href: `/${locale}/sources`, description: dict.navDesc.sources },
      ],
    },
    { name: dict.nav.counterNarrative, href: `/${locale}/counter-narrative`, description: dict.navDesc.counterNarrative },
    { name: dict.nav.library, href: `/${locale}/library`, description: dict.navDesc.library },
    { name: dict.nav.chronicles, href: `/${locale}/chronicles`, description: dict.navDesc.chronicles },
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
      <BreakingNewsTicker locale={locale} />

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
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.children ? (
                    <button className="inline-flex items-center gap-1 h-9 px-3 font-heading text-[11px] font-semibold uppercase tracking-wider text-slate-medium transition-colors hover:text-tactical-red">
                      {item.name}
                      <ChevronDown className={`h-3 w-3 ${isRTL ? 'mr-1' : 'ml-1'}`} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="inline-flex items-center h-9 px-3 font-heading text-[11px] font-semibold uppercase tracking-wider text-slate-medium transition-colors hover:text-tactical-red"
                    >
                      {item.name}
                    </Link>
                  )}

                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.children && activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-full mt-1 w-56 rounded-lg border border-midnight-600 bg-midnight-800 p-2 shadow-xl z-50 ${isRTL ? 'right-0' : 'left-0'}`}
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="block rounded-md px-3 py-2 transition-colors hover:bg-midnight-700"
                          >
                            <span className="block font-heading text-xs font-medium uppercase text-slate-light">
                              {child.name}
                            </span>
                            <span className="text-[10px] text-slate-dark">{child.description}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Language Toggle */}
              <button
                onClick={switchLanguage}
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
                  <div key={item.name}>
                    {item.children ? (
                      <div className="py-2">
                        <div className="flex items-center gap-2 px-3 py-2 font-heading text-xs font-semibold uppercase tracking-wider text-slate-dark border-b border-midnight-700 mb-2">
                          {item.name}
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="flex flex-col rounded-md px-3 py-2.5 bg-midnight-700/50 hover:bg-midnight-700 transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span className="font-heading text-xs font-medium uppercase tracking-wider text-slate-light">
                                {child.name}
                              </span>
                              <span className="text-[10px] text-slate-dark mt-0.5">
                                {child.description}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className="flex items-center justify-between rounded-md px-3 py-3 font-heading text-sm font-medium uppercase tracking-wider text-slate-medium hover:bg-midnight-700 hover:text-tactical-red transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                        <span className="text-[10px] text-slate-dark font-normal normal-case tracking-normal">
                          {item.description}
                        </span>
                      </Link>
                    )}
                  </div>
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
