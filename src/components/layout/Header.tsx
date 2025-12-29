"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Globe,
  Radio,
  ChevronDown,
  Binoculars,
  Send,
} from "lucide-react";
import BreakingNewsTicker from "@/components/ui/BreakingNewsTicker";

const navigation = [
  { name: "The Frontline", href: "/frontline", description: "Breaking News" },
  { name: "Deep Dives", href: "/analysis", description: "Geopolitical Analysis" },
  {
    name: "Intelligence",
    href: "#",
    children: [
      { name: "Situation Room", href: "/situation-room", description: "Interactive Maps" },
      { name: "The Dossier", href: "/dossier", description: "Key Figures" },
      { name: "The Arsenal", href: "/arsenal", description: "Military Analysis" },
      { name: "Primary Sources", href: "/sources", description: "Document Archive" },
    ],
  },
  { name: "Counter-Narrative", href: "/counter-narrative", description: "Media Critique" },
  { name: "The Library", href: "/library", description: "Book Reviews" },
  { name: "Chronicles", href: "/chronicles", description: "Historical Timeline" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "ar">("en");

  return (
    <header className="sticky top-0 z-50">
      {/* Breaking News Ticker */}
      <BreakingNewsTicker />

      {/* Main Header */}
      <div className="bg-midnight-800 backdrop-blur-md border-b border-midnight-600">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="relative">
                <Binoculars className="h-6 w-6 text-tactical-red transition-all group-hover:text-tactical-amber" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading text-base font-bold tracking-wider text-slate-light">
                  THE OBSERVER
                </span>
                <span className="text-[8px] uppercase tracking-[0.15em] text-slate-dark">
                  Intelligence & Analysis
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
                      <ChevronDown className="h-3 w-3" />
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
                        className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-midnight-600 bg-midnight-800 p-2 shadow-xl z-50"
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
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className="flex items-center gap-1.5 rounded-full border border-midnight-500 px-2.5 py-1 font-heading text-[10px] font-medium uppercase tracking-wider text-slate-medium transition-all hover:border-tactical-red hover:text-tactical-red"
              >
                <Globe className="h-3 w-3" />
                {language === "en" ? "EN" : "AR"}
              </button>

              {/* Telegram CTA */}
              <a
                href="https://t.me/observer_5"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-full bg-tactical-red px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover sm:flex"
              >
                <Send className="h-3 w-3" />
                Join Intel
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
                  href="https://t.me/observer_5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-tactical-red px-4 py-3 font-heading text-sm font-bold uppercase tracking-wider text-white hover:bg-tactical-red-hover transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Join Intelligence Network
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
