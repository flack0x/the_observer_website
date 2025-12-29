"use client";

import { motion } from "framer-motion";
import { User, Shield, ArrowRight, Star, FileText } from "lucide-react";
import Link from "next/link";

const keyFigures = [
  {
    id: 1,
    name: "Profile Alpha",
    role: "Strategic Commander",
    region: "Northern Theater",
    influence: "High",
    status: "Active",
  },
  {
    id: 2,
    name: "Profile Beta",
    role: "Political Strategist",
    region: "Central Region",
    influence: "Critical",
    status: "Active",
  },
  {
    id: 3,
    name: "Profile Gamma",
    role: "Economic Advisor",
    region: "Eastern Corridor",
    influence: "Moderate",
    status: "Monitoring",
  },
  {
    id: 4,
    name: "Profile Delta",
    role: "Military Liaison",
    region: "Southern Sector",
    influence: "High",
    status: "Active",
  },
];

const getInfluenceColor = (influence: string) => {
  switch (influence) {
    case "Critical":
      return "text-tactical-red bg-tactical-red/10";
    case "High":
      return "text-tactical-amber bg-tactical-amber/10";
    default:
      return "text-earth-olive bg-earth-olive/10";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-tactical-red";
    default:
      return "bg-tactical-amber";
  }
};

export default function DossierPreview() {
  return (
    <section className="border-t border-midnight-700 bg-midnight-900 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-earth-olive/10">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-earth-olive" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-light">
                The Dossier
              </h2>
              <p className="text-xs sm:text-sm text-slate-dark">Key figures & influence profiles</p>
            </div>
          </div>
          <Link
            href="/dossier"
            className="group flex items-center gap-2 font-heading text-xs sm:text-sm font-medium uppercase tracking-wider text-earth-olive transition-colors hover:text-tactical-amber"
          >
            Full Database
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Profiles Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {keyFigures.map((figure, index) => (
            <motion.article
              key={figure.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-midnight-600 bg-midnight-800 p-3 sm:p-5 transition-all hover:border-earth-olive card-hover"
            >
              {/* Status Indicator */}
              <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
                <div className="flex items-center gap-1">
                  <motion.div
                    className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${getStatusColor(figure.status)}`}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="font-mono text-[8px] sm:text-[10px] uppercase text-slate-dark hidden sm:inline">
                    {figure.status}
                  </span>
                </div>
              </div>

              {/* Avatar */}
              <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-midnight-600 bg-midnight-700">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-slate-dark" />
              </div>

              {/* Info */}
              <h4 className="font-heading text-sm sm:text-lg font-bold uppercase tracking-wider text-slate-light">
                {figure.name}
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-dark">{figure.role}</p>

              {/* Meta */}
              <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 border-t border-midnight-700 pt-3 sm:pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-slate-dark">Region</span>
                  <span className="font-mono text-[10px] sm:text-xs text-slate-medium truncate ml-2">{figure.region}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-slate-dark">Influence</span>
                  <span
                    className={`rounded px-1.5 sm:px-2 py-0.5 font-heading text-[8px] sm:text-[10px] font-bold uppercase ${getInfluenceColor(
                      figure.influence
                    )}`}
                  >
                    {figure.influence}
                  </span>
                </div>
              </div>

              {/* Hover Action */}
              <div className="absolute inset-x-0 bottom-0 translate-y-full bg-earth-olive/10 p-3 transition-transform group-hover:translate-y-0">
                <Link
                  href={`/dossier/${figure.id}`}
                  className="flex items-center justify-center gap-2 font-heading text-xs font-medium uppercase tracking-wider text-earth-olive"
                >
                  View Full Dossier
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Classified Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 rounded-lg border border-dashed border-midnight-600 bg-midnight-800/50 p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-slate-dark">
            <Shield className="h-4 w-4" />
            <span>
              Access to detailed profiles requires{" "}
              <Link href="/subscribe" className="text-tactical-red hover:underline">
                Intelligence Network membership
              </Link>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
