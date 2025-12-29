"use client";

import { motion } from "framer-motion";
import { User, Shield, ArrowRight, Search, Filter, FileText } from "lucide-react";
import Link from "next/link";

const profiles = [
  {
    id: 1,
    codename: "Profile Alpha",
    role: "Strategic Commander",
    region: "Northern Theater",
    influence: "Critical",
    status: "Active",
    affiliation: "Resistance Axis",
    yearsActive: "15+",
  },
  {
    id: 2,
    codename: "Profile Beta",
    role: "Political Strategist",
    region: "Central Region",
    influence: "Critical",
    status: "Active",
    affiliation: "Regional Alliance",
    yearsActive: "12+",
  },
  {
    id: 3,
    codename: "Profile Gamma",
    role: "Economic Advisor",
    region: "Eastern Corridor",
    influence: "High",
    status: "Monitoring",
    affiliation: "State Actor",
    yearsActive: "8+",
  },
  {
    id: 4,
    codename: "Profile Delta",
    role: "Military Liaison",
    region: "Southern Sector",
    influence: "High",
    status: "Active",
    affiliation: "Defense Network",
    yearsActive: "10+",
  },
  {
    id: 5,
    codename: "Profile Epsilon",
    role: "Intelligence Chief",
    region: "Western Front",
    influence: "Critical",
    status: "Active",
    affiliation: "Security Apparatus",
    yearsActive: "20+",
  },
  {
    id: 6,
    codename: "Profile Zeta",
    role: "Diplomatic Envoy",
    region: "International",
    influence: "Moderate",
    status: "Active",
    affiliation: "Foreign Ministry",
    yearsActive: "7+",
  },
];

const getInfluenceColor = (influence: string) => {
  switch (influence) {
    case "Critical":
      return "text-tactical-red bg-tactical-red/10 border-tactical-red/30";
    case "High":
      return "text-tactical-amber bg-tactical-amber/10 border-tactical-amber/30";
    default:
      return "text-earth-olive bg-earth-olive/10 border-earth-olive/30";
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

export default function DossierPage() {
  return (
    <div className="min-h-screen bg-midnight-900">
      {/* Hero */}
      <section className="border-b border-midnight-700 bg-midnight-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-earth-olive/10">
                <FileText className="h-6 w-6 text-earth-olive" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-slate-light">
                  The Dossier
                </h1>
                <p className="text-slate-dark">Key figures & influence profiles database</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="border-b border-midnight-700 bg-midnight-800/50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-midnight-600 bg-midnight-700 px-4 py-2">
                <Search className="h-4 w-4 text-slate-dark" />
                <input
                  type="text"
                  placeholder="Search profiles..."
                  className="w-48 bg-transparent text-sm text-slate-light placeholder-slate-dark outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-dark" />
                <select className="rounded-lg border border-midnight-600 bg-midnight-700 px-3 py-2 font-heading text-xs uppercase text-slate-light">
                  <option>All Regions</option>
                  <option>Northern Theater</option>
                  <option>Central Region</option>
                  <option>Southern Sector</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-slate-dark">
              Showing <span className="text-slate-light">{profiles.length}</span> profiles
            </div>
          </div>
        </div>
      </section>

      {/* Profiles Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile, index) => (
              <motion.article
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl border border-midnight-600 bg-midnight-800 transition-all hover:border-earth-olive card-hover"
              >
                {/* Header */}
                <div className="border-b border-midnight-700 bg-midnight-700 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        className={`h-2 w-2 rounded-full ${getStatusColor(profile.status)}`}
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="font-mono text-[10px] uppercase text-slate-dark">
                        {profile.status}
                      </span>
                    </div>
                    <span
                      className={`rounded border px-2 py-0.5 font-heading text-[10px] font-bold uppercase ${getInfluenceColor(
                        profile.influence
                      )}`}
                    >
                      {profile.influence}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Avatar */}
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-midnight-600 bg-midnight-700">
                      <User className="h-10 w-10 text-slate-dark" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center">
                    <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
                      {profile.codename}
                    </h3>
                    <p className="mt-1 text-sm text-tactical-amber">{profile.role}</p>
                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-2 border-t border-midnight-700 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-dark">Region</span>
                      <span className="font-mono text-xs text-slate-light">{profile.region}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-dark">Affiliation</span>
                      <span className="font-mono text-xs text-slate-light">{profile.affiliation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-dark">Years Active</span>
                      <span className="font-mono text-xs text-slate-light">{profile.yearsActive}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-midnight-700 bg-midnight-700/50 px-5 py-3">
                  <Link
                    href={`/dossier/${profile.id}`}
                    className="flex items-center justify-center gap-2 font-heading text-xs font-medium uppercase tracking-wider text-earth-olive transition-colors hover:text-tactical-amber"
                  >
                    View Full Dossier
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Access Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 rounded-xl border border-dashed border-midnight-600 bg-midnight-800/50 p-6 text-center"
          >
            <Shield className="mx-auto mb-3 h-8 w-8 text-slate-dark" />
            <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
              Restricted Access
            </h4>
            <p className="mx-auto max-w-md text-sm text-slate-dark">
              Full dossier access including operational history, network analysis, and
              real-time tracking requires Intelligence Network membership.
            </p>
            <Link
              href="/subscribe"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-tactical-red px-6 py-2 font-heading text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover"
            >
              Request Access
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
