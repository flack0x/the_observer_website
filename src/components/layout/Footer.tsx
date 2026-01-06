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

  const footerLinks = [
    { name: dict.nav.frontline, href: `/${locale}/frontline` },
    { name: dict.nav.situationRoom, href: `/${locale}/situation-room` },
    { name: dict.nav.dossier, href: `/${locale}/dossier` },
    { name: dict.nav.chronicles, href: `/${locale}/chronicles` },
    { name: dict.nav.about, href: `/${locale}/about` },
  ];

  return (
    <footer className="border-t border-midnight-600 bg-midnight-900">
      {/* Newsletter Section */}
      <div className="border-b border-midnight-700 bg-midnight-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:gap-6 lg:flex-row">
            <div className="text-center lg:text-start">
              <h3 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-light">
                {dict.footer.intelligenceBrief}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-dark">
                {dict.footer.newsletterSubtitle}
              </p>
            </div>
            {status === "success" ? (
              <div className="flex items-center gap-2 rounded-lg bg-earth-olive/20 px-4 py-3 text-earth-olive">
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
                <span className="text-sm font-medium">{message}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-md gap-2">
                <label htmlFor="newsletter-email" className="sr-only">
                  {dict.footer.emailPlaceholder}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={dict.footer.emailPlaceholder}
                  className="flex-1 rounded-lg border border-midnight-500 bg-midnight-700 px-4 py-3 font-body text-sm text-slate-light placeholder-slate-dark transition-colors focus:border-tactical-red focus:outline-none focus:ring-1 focus:ring-tactical-red"
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  disabled={status === "loading"}
                  required
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  aria-busy={status === "loading"}
                  className="flex items-center justify-center gap-2 rounded-lg bg-tactical-red px-6 py-3 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-tactical-red"
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
            {status === "error" && (
              <p className="mt-2 text-xs text-tactical-red">{message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                <Image
                  src="/images/observer-silhouette.png"
                  alt="The Observer"
                  fill
                  className="object-contain logo-gold"
                />
              </div>
              <div>
                <span className="font-heading text-lg sm:text-xl font-bold tracking-wider text-slate-light">
                  {dict.header.title}
                </span>
              </div>
            </Link>
            <p className="mt-3 sm:mt-4 max-w-sm text-xs sm:text-sm leading-relaxed text-slate-dark">
              {dict.footer.description}
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
              <a
                href={TELEGRAM_CHANNELS.en}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-midnight-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-medium transition-colors hover:bg-tactical-red hover:text-white"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                English
              </a>
              <a
                href={TELEGRAM_CHANNELS.ar}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-midnight-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-medium transition-colors hover:bg-tactical-red hover:text-white"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                العربية
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-light">
              {dict.footer.navigate}
            </h4>
            <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-slate-dark transition-colors hover:text-tactical-red"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 flex flex-col items-center justify-between gap-3 sm:gap-4 border-t border-midnight-700 pt-6 sm:pt-8 lg:flex-row">
          <p className="text-[10px] sm:text-xs text-slate-dark text-center">
            {dict.footer.copyright}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-dark">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" aria-hidden="true" />
              {dict.footer.secureIndependent}
            </span>
            <Link href={`/${locale}/privacy`} className="hover:text-tactical-red">
              {dict.footer.privacy}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-tactical-red">
              {dict.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
