"use client";

import { motion } from "framer-motion";
import { Crosshair, ArrowRight, Zap, Filter, Search, Shield, Target } from "lucide-react";
import Link from "next/link";

const weaponSystems = [
  {
    id: 1,
    name: "Precision Strike System",
    designation: "PSS-2000",
    category: "Ballistic Missiles",
    status: "Operational",
    specs: {
      range: "2000+ km",
      accuracy: "CEP < 10m",
      payload: "500-1000 kg",
      guidance: "GPS/INS + Terminal",
    },
    impact: "Strategic deterrence and precision strike capability against high-value targets",
    origin: "Indigenous Development",
  },
  {
    id: 2,
    name: "Advanced UAV Platform",
    designation: "SUAV-X1",
    category: "Unmanned Aerial Systems",
    status: "Deployed",
    specs: {
      endurance: "24+ hours",
      ceiling: "40,000 ft",
      payload: "Multi-role ISR/Strike",
      range: "1500 km",
    },
    impact: "Long-range ISR and precision strike capabilities with minimal signature",
    origin: "Joint Development",
  },
  {
    id: 3,
    name: "Integrated Air Defense",
    designation: "IAD-S400",
    category: "Air Defense Systems",
    status: "Active",
    specs: {
      layers: "Multi-tier defense",
      coverage: "400 km radius",
      tracking: "Multi-target simultaneous",
      missiles: "4 types",
    },
    impact: "Comprehensive airspace denial across strategic zones",
    origin: "Technology Transfer",
  },
  {
    id: 4,
    name: "Anti-Ship Cruise Missile",
    designation: "ASCM-800",
    category: "Naval Warfare",
    status: "Operational",
    specs: {
      range: "800 km",
      speed: "Mach 2.5+",
      guidance: "Active radar seeker",
      warhead: "300 kg HE",
    },
    impact: "Maritime denial capability against surface combatants",
    origin: "Indigenous Development",
  },
  {
    id: 5,
    name: "Electronic Warfare Suite",
    designation: "EW-7000",
    category: "Electronic Warfare",
    status: "Deployed",
    specs: {
      coverage: "Full spectrum",
      jamming: "Adaptive multi-band",
      detection: "360° situational",
      integration: "Network-centric",
    },
    impact: "Electromagnetic spectrum dominance and communications disruption",
    origin: "Domestic Production",
  },
  {
    id: 6,
    name: "Loitering Munition",
    designation: "LM-Delta",
    category: "Precision Munitions",
    status: "Operational",
    specs: {
      endurance: "6+ hours",
      speed: "Variable",
      warhead: "Shaped charge",
      guidance: "EO/IR + AI",
    },
    impact: "Persistent ISR with immediate strike capability against mobile targets",
    origin: "Reverse Engineering",
  },
];

const categories = ["All", "Ballistic Missiles", "Air Defense", "Naval Warfare", "Electronic Warfare", "UAV Systems"];

export default function ArsenalPage() {
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
              <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-tactical-red/10">
                <Crosshair className="h-6 w-6 text-tactical-red" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-slate-light">
                  The Arsenal
                </h1>
                <p className="text-slate-dark">Military systems analysis & technical specifications</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-midnight-700 bg-midnight-800/50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-midnight-600 bg-midnight-700 px-4 py-2">
              <Search className="h-4 w-4 text-slate-dark" />
              <input
                type="text"
                placeholder="Search systems..."
                className="w-48 bg-transparent text-sm text-slate-light placeholder-slate-dark outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`rounded-full px-4 py-1.5 font-heading text-xs font-medium uppercase tracking-wider transition-all ${
                    category === "All"
                      ? "bg-tactical-red text-white"
                      : "border border-midnight-600 text-slate-medium hover:border-tactical-red hover:text-tactical-red"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Systems Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {weaponSystems.map((system, index) => (
              <motion.article
                key={system.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group overflow-hidden rounded-xl border border-midnight-600 bg-midnight-800 transition-all hover:border-tactical-red"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-midnight-700 bg-midnight-700 px-5 py-4">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded bg-tactical-red/20 px-2 py-0.5 font-heading text-[10px] font-bold uppercase text-tactical-red">
                        {system.category}
                      </span>
                      <span className="font-mono text-xs text-slate-dark">{system.designation}</span>
                    </div>
                    <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
                      {system.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      className="h-2 w-2 rounded-full bg-earth-olive"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="font-mono text-[10px] uppercase text-slate-dark">
                      {system.status}
                    </span>
                  </div>
                </div>

                {/* Specs */}
                <div className="p-5">
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    {Object.entries(system.specs).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-lg border border-midnight-700 bg-midnight-900 p-3"
                      >
                        <span className="block font-heading text-[10px] uppercase tracking-wider text-slate-dark">
                          {key}
                        </span>
                        <span className="font-mono text-sm text-slate-light">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Impact */}
                  <div className="rounded-lg bg-midnight-700 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-tactical-amber" />
                      <span className="font-heading text-xs uppercase tracking-wider text-tactical-amber">
                        Strategic Impact
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-medium">{system.impact}</p>
                  </div>

                  {/* Origin */}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-dark">
                    <span>Origin: {system.origin}</span>
                    <Link
                      href={`/arsenal/${system.id}`}
                      className="flex items-center gap-1 font-heading font-medium uppercase tracking-wider text-tactical-red transition-colors hover:text-tactical-amber"
                    >
                      Full Analysis
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex flex-col items-center justify-between gap-6 rounded-xl border border-midnight-600 bg-midnight-800 p-8 sm:flex-row"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tactical-red/10">
                <Target className="h-7 w-7 text-tactical-red" />
              </div>
              <div>
                <h4 className="font-heading text-xl font-bold uppercase tracking-wider text-slate-light">
                  Defense Technology Database
                </h4>
                <p className="text-sm text-slate-dark">
                  Access classified specifications and comparative analysis reports
                </p>
              </div>
            </div>
            <Link
              href="/subscribe"
              className="flex items-center gap-2 rounded-lg bg-tactical-red px-8 py-4 font-heading text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover"
            >
              <Shield className="h-5 w-5" />
              Unlock Full Access
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
