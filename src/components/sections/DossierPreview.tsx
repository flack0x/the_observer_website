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
    <section className="border-t border-midnight-700 bg-midnight-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-earth-olive/10">
              <FileText className="h-5 w-5 text-earth-olive" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
                The Dossier
              </h2>
              <p className="text-sm text-slate-dark">Key figures & influence profiles</p>
            </div>
          </div>
          <Link
            href="/dossier"
            className="group flex items-center gap-2 font-heading text-sm font-medium uppercase tracking-wider text-earth-olive transition-colors hover:text-tactical-amber"
          >
            Full Database
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Profiles Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {keyFigures.map((figure, index) => (
            <motion.article
              key={figure.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-midnight-600 bg-midnight-800 p-5 transition-all hover:border-earth-olive card-hover"
            >
              {/* Status Indicator */}
              <div className="absolute right-3 top-3">
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className={`h-2 w-2 rounded-full ${getStatusColor(figure.status)}`}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="font-mono text-[10px] uppercase text-slate-dark">
                    {figure.status}
                  </span>
                </div>
              </div>

              {/* Avatar */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-midnight-600 bg-midnight-700">
                <User className="h-8 w-8 text-slate-dark" />
              </div>

              {/* Info */}
              <h4 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
                {figure.name}
              </h4>
              <p className="mt-1 text-sm text-slate-dark">{figure.role}</p>

              {/* Meta */}
              <div className="mt-4 space-y-2 border-t border-midnight-700 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-dark">Region</span>
                  <span className="font-mono text-xs text-slate-medium">{figure.region}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-dark">Influence</span>
                  <span
                    className={`rounded px-2 py-0.5 font-heading text-[10px] font-bold uppercase ${getInfluenceColor(
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
