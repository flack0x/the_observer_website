"use client";

import { motion } from "framer-motion";
import { Map, Crosshair, Layers, ArrowRight, Activity, Radar } from "lucide-react";
import Link from "next/link";

const mapLayers = [
  { name: "Active Conflicts", count: 12, color: "bg-tactical-red" },
  { name: "Military Movements", count: 28, color: "bg-tactical-amber" },
  { name: "Strategic Assets", count: 45, color: "bg-earth-olive" },
  { name: "Resource Corridors", count: 8, color: "bg-earth-sand" },
];

export default function SituationRoomPreview() {
  return (
    <section className="border-t border-midnight-700 bg-midnight-800 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-5 sm:mb-6 flex items-center gap-3 sm:gap-4">
              <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-tactical-red/10">
                <Map className="h-5 w-5 sm:h-6 sm:w-6 text-tactical-red" />
                <motion.div
                  className="absolute inset-0 rounded-lg border border-tactical-red/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-light">
                  The Situation Room
                </h2>
                <p className="text-xs sm:text-sm text-slate-dark">Interactive intelligence mapping</p>
              </div>
            </div>

            <p className="mb-6 sm:mb-8 font-body text-base sm:text-lg leading-relaxed text-slate-medium">
              Access real-time annotated maps showing troop movements, territorial
              control, resource pipelines, and strategic installations. Visualize
              the &quot;where&quot; to understand the &quot;why.&quot;
            </p>

            {/* Map Layers */}
            <div className="mb-6 sm:mb-8 space-y-2 sm:space-y-3">
              {mapLayers.map((layer, index) => (
                <motion.div
                  key={layer.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border border-midnight-600 bg-midnight-700 px-3 py-2.5 sm:px-4 sm:py-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${layer.color}`} />
                    <span className="font-heading text-xs sm:text-sm uppercase tracking-wider text-slate-light">
                      {layer.name}
                    </span>
                  </div>
                  <span className="rounded bg-midnight-600 px-2 py-0.5 font-mono text-[10px] sm:text-xs text-slate-medium">
                    {layer.count} active
                  </span>
                </motion.div>
              ))}
            </div>

            <Link
              href="/situation-room"
              className="group inline-flex items-center gap-2 rounded-lg bg-tactical-red px-4 py-2.5 sm:px-6 sm:py-3 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover"
            >
              <Crosshair className="h-4 w-4 sm:h-5 sm:w-5" />
              Enter Situation Room
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Map Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-midnight-600 bg-midnight-900">
              {/* Grid Background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(178, 34, 34, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(178, 34, 34, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Radar Sweep Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, rgba(178, 34, 34, 0.2) 30deg, transparent 60deg)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Map Points */}
              <div className="absolute inset-0 p-8">
                {/* Simulated map points */}
                <motion.div
                  className="absolute left-[20%] top-[30%]"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative">
                    <div className="h-3 w-3 rounded-full bg-tactical-red" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-tactical-red opacity-50" />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute right-[25%] top-[40%]"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="relative">
                    <div className="h-3 w-3 rounded-full bg-tactical-amber" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-tactical-amber opacity-50" />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute left-[45%] bottom-[25%]"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <div className="relative">
                    <div className="h-3 w-3 rounded-full bg-earth-olive" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-earth-olive opacity-50" />
                  </div>
                </motion.div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 h-full w-full">
                  <line
                    x1="20%"
                    y1="30%"
                    x2="75%"
                    y2="40%"
                    stroke="rgba(178, 34, 34, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="75%"
                    y1="40%"
                    x2="45%"
                    y2="75%"
                    stroke="rgba(255, 191, 0, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Overlay UI */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-midnight-600 bg-midnight-800/90 px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-tactical-red" />
                  <span className="font-mono text-xs text-slate-light">LIVE FEED</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-slate-dark">LAT: 33.8938</span>
                  <span className="font-mono text-xs text-slate-dark">LON: 35.5018</span>
                </div>
              </div>

              {/* Corner Markers */}
              <div className="absolute left-2 top-2 h-6 w-6 border-l-2 border-t-2 border-tactical-red/50" />
              <div className="absolute right-2 top-2 h-6 w-6 border-r-2 border-t-2 border-tactical-red/50" />
              <div className="absolute bottom-2 left-2 h-6 w-6 border-b-2 border-l-2 border-tactical-red/50" />
              <div className="absolute bottom-2 right-2 h-6 w-6 border-b-2 border-r-2 border-tactical-red/50" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
