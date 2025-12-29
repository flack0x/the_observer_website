"use client";

import { motion } from "framer-motion";
import { Crosshair, ArrowRight, Zap, Target, Shield } from "lucide-react";
import Link from "next/link";

const weaponSystems = [
  {
    id: 1,
    name: "Precision Strike System",
    category: "Missile Technology",
    status: "Operational",
    specs: {
      range: "2000+ km",
      accuracy: "CEP < 10m",
      payload: "Variable",
    },
    impact: "Strategic deterrence capability",
  },
  {
    id: 2,
    name: "Advanced UAV Platform",
    category: "Aerial Systems",
    status: "Deployed",
    specs: {
      endurance: "24+ hours",
      ceiling: "40,000 ft",
      payload: "Multi-role",
    },
    impact: "ISR and precision strike",
  },
  {
    id: 3,
    name: "Integrated Air Defense",
    category: "Defense Systems",
    status: "Active",
    specs: {
      layers: "Multi-tier",
      coverage: "Regional",
      tracking: "Multi-target",
    },
    impact: "Airspace denial capability",
  },
];

export default function ArsenalPreview() {
  return (
    <section className="border-t border-midnight-700 bg-midnight-800 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-tactical-red/10">
              <Crosshair className="h-4 w-4 sm:h-5 sm:w-5 text-tactical-red" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-light">
                The Arsenal
              </h2>
              <p className="text-xs sm:text-sm text-slate-dark">Military systems analysis</p>
            </div>
          </div>
          <Link
            href="/arsenal"
            className="group flex items-center gap-2 font-heading text-xs sm:text-sm font-medium uppercase tracking-wider text-tactical-red transition-colors hover:text-tactical-amber"
          >
            Full Arsenal
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Weapon Systems */}
        <div className="grid gap-6 lg:grid-cols-3">
          {weaponSystems.map((system, index) => (
            <motion.article
              key={system.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group overflow-hidden rounded-xl border border-midnight-600 bg-midnight-900 transition-all hover:border-tactical-red card-hover"
            >
              {/* Header */}
              <div className="border-b border-midnight-700 bg-midnight-800 px-5 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-tactical-red/20 px-2 py-0.5 font-heading text-[10px] font-bold uppercase text-tactical-red">
                    {system.category}
                  </span>
                  <div className="flex items-center gap-1">
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
                <h4 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
                  {system.name}
                </h4>
              </div>

              {/* Specs */}
              <div className="p-5">
                <div className="mb-4 space-y-2">
                  {Object.entries(system.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between border-b border-midnight-700 pb-2"
                    >
                      <span className="font-heading text-xs uppercase tracking-wider text-slate-dark">
                        {key}
                      </span>
                      <span className="font-mono text-sm text-slate-light">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Impact */}
                <div className="rounded-lg bg-midnight-800 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Zap className="h-3 w-3 text-tactical-amber" />
                    <span className="font-heading text-[10px] uppercase tracking-wider text-tactical-amber">
                      Strategic Impact
                    </span>
                  </div>
                  <p className="text-sm text-slate-medium">{system.impact}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-midnight-700 bg-midnight-800 px-5 py-3">
                <Link
                  href={`/arsenal/${system.id}`}
                  className="flex items-center justify-between font-heading text-xs font-medium uppercase tracking-wider text-slate-dark transition-colors hover:text-tactical-red"
                >
                  <span>Technical Analysis</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-12 flex flex-col items-center justify-between gap-4 sm:gap-6 rounded-xl border border-midnight-600 bg-midnight-900 p-5 sm:p-8 sm:flex-row"
        >
          <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-tactical-red/10 shrink-0">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-tactical-red" />
            </div>
            <div>
              <h4 className="font-heading text-base sm:text-lg font-bold uppercase tracking-wider text-slate-light">
                Defense Technology Database
              </h4>
              <p className="text-xs sm:text-sm text-slate-dark">
                Access detailed specifications and strategic assessments
              </p>
            </div>
          </div>
          <Link
            href="/arsenal"
            className="flex items-center gap-2 rounded-lg border border-tactical-red bg-tactical-red/10 px-4 py-2.5 sm:px-6 sm:py-3 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-tactical-red transition-all hover:bg-tactical-red hover:text-white w-full sm:w-auto justify-center"
          >
            <Shield className="h-4 w-4" />
            Access Arsenal
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
