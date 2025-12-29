"use client";

import Link from "next/link";
import { Eye, Send, Mail, Shield, FileText, BookOpen } from "lucide-react";

const footerLinks = {
  intelligence: [
    { name: "The Frontline", href: "/frontline" },
    { name: "Situation Room", href: "/situation-room" },
    { name: "The Dossier", href: "/dossier" },
    { name: "The Arsenal", href: "/arsenal" },
  ],
  analysis: [
    { name: "Deep Dives", href: "/analysis" },
    { name: "Counter-Narrative", href: "/counter-narrative" },
    { name: "Economic Warfare", href: "/economic-warfare" },
    { name: "Chronicles", href: "/chronicles" },
  ],
  resources: [
    { name: "The Library", href: "/library" },
    { name: "Primary Sources", href: "/sources" },
    { name: "Underground Voice", href: "/underground" },
    { name: "Polls", href: "/polls" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-midnight-600 bg-midnight-900">
      {/* Newsletter Section */}
      <div className="border-b border-midnight-700 bg-midnight-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="text-center lg:text-left">
              <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-slate-light">
                Intelligence Brief
              </h3>
              <p className="mt-1 text-sm text-slate-dark">
                Weekly strategic analysis delivered to your inbox
              </p>
            </div>
            <form className="flex w-full max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-midnight-500 bg-midnight-700 px-4 py-3 font-body text-sm text-slate-light placeholder-slate-dark transition-colors focus:border-tactical-red focus:outline-none focus:ring-1 focus:ring-tactical-red"
              />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-tactical-red px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-tactical-red-hover"
              >
                <Mail className="h-4 w-4" />
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-tactical-red" />
              <div>
                <span className="font-heading text-xl font-bold tracking-wider text-slate-light">
                  THE OBSERVER
                </span>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-dark">
              Independent geopolitical intelligence and strategic analysis.
              Cutting through the noise to deliver clarity on global conflicts
              and power dynamics.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://t.me/observer_5"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-midnight-700 px-4 py-2 text-sm text-slate-medium transition-colors hover:bg-tactical-red hover:text-white"
              >
                <Send className="h-4 w-4" />
                English
              </a>
              <a
                href="https://t.me/almuraqb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-midnight-700 px-4 py-2 text-sm text-slate-medium transition-colors hover:bg-tactical-red hover:text-white"
              >
                <Send className="h-4 w-4" />
                العربية
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
              Intelligence
            </h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.intelligence.map((link) => (
                <li key={link.name}>
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

          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
              Analysis
            </h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.analysis.map((link) => (
                <li key={link.name}>
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

          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
              Resources
            </h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
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
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-midnight-700 pt-8 lg:flex-row">
          <p className="text-xs text-slate-dark">
            &copy; {new Date().getFullYear()} The Observer. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-dark">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Secure & Independent
            </span>
            <Link href="/privacy" className="hover:text-tactical-red">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-tactical-red">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
