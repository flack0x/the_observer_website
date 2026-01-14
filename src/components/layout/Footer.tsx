"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, Mail, Shield, CheckCircle, Loader2 } from "lucide-react";
import type { Locale, Dictionary } from "@/lib/i18n";
import { TELEGRAM_CHANNELS } from "@/lib/config";

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
}

export default function Footer({ locale, dict }: FooterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const isRTL = locale === 'ar';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error);
        return;
      }

      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(dict.footer.errorMessage);
    }
  };

  // Main navigation links - synced with Header
  const navLinks = [
    { name: dict.nav.frontline, href: `/${locale}/frontline` },
    { name: dict.nav.situationRoom, href: `/${locale}/situation-room` },
    { name: dict.nav.books, href: `/${locale}/books` },
    { name: dict.nav.dossier, href: `/${locale}/dossier` },
    { name: dict.nav.chronicles, href: `/${locale}/chronicles` },
    { name: dict.nav.about, href: `/${locale}/about` },
  ];

  // Legal/Resources links
  const legalLinks = [
    { name: dict.footer.privacy, href: `/${locale}/privacy` },
    { name: dict.footer.terms, href: `/${locale}/terms` },
  ];

  return (
    <footer className="border-t border-midnight-600 bg-midnight-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Newsletter Section */}
      <div className="border-b border-midnight-700 bg-midnight-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
            <div className="text-center lg:text-start">
              <h3 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-light">
                {dict.footer.intelligenceBrief}
              </h3>
              <p className="mt-1.5 text-sm text-slate-dark max-w-md">
                {dict.footer.newsletterSubtitle}
              </p>
            </div>
            {status === "success" ? (
              <div className="flex items-center gap-2 rounded-lg bg-earth-olive/20 px-5 py-3 text-earth-olive">
                <CheckCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium">{message}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-lg gap-3">
                <label htmlFor="newsletter-email" className="sr-only">
                  {dict.footer.emailPlaceholder}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dict.footer.emailPlaceholder}
                  className="flex-1 rounded-lg border border-midnight-500 bg-midnight-700 px-4 py-3 font-body text-sm text-slate-light placeholder-slate-dark transition-all focus:border-tactical-red focus:outline-none focus:ring-2 focus:ring-tactical-red/20"
                  dir={isRTL ? 'rtl' : 'ltr'}
                  disabled={status === "loading"}
                  required
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  aria-busy={status === "loading"}
                  className="flex items-center justify-center gap-2 rounded-lg bg-tactical-red px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  )}
                  {dict.footer.subscribe}
                </button>
              </form>
            )}
          </div>
          {status === "error" && (
            <p className="mt-3 text-center lg:text-end text-sm text-tactical-red">{message}</p>
          )}
        </div>
      </div>

      {/* Main Footer Content - 4 Column Layout */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={`/${locale}`} className="inline-flex items-center gap-3 group">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/images/observer-silhouette.png"
                  alt="The Observer"
                  fill
                  className="object-contain logo-gold transition-opacity group-hover:opacity-100"
                />
              </div>
              <span className="font-heading text-lg font-bold tracking-wider text-slate-light">
                {dict.header.title}
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-dark">
              {dict.footer.description}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-dark">
              <Shield className="h-4 w-4 text-earth-olive" aria-hidden="true" />
              <span>{dict.footer.secureIndependent}</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light mb-4">
              {dict.footer.navigate}
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-dark transition-colors hover:text-tactical-red"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light mb-4">
              {locale === 'en' ? 'Legal' : 'قانوني'}
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-dark transition-colors hover:text-tactical-red"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light mb-4">
              {locale === 'en' ? 'Connect' : 'تواصل'}
            </h4>
            <div className="space-y-3">
              <a
                href={TELEGRAM_CHANNELS.en}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-dark transition-colors hover:text-tactical-red"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Telegram (EN)
              </a>
              <a
                href={TELEGRAM_CHANNELS.ar}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-dark transition-colors hover:text-tactical-red"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Telegram (AR)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-midnight-700 bg-midnight-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-dark">
            {dict.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
