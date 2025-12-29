"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Map,
  Layers,
  Crosshair,
  Activity,
  ZoomIn,
  ZoomOut,
  Maximize,
  Info,
} from "lucide-react";

const mapLayers = [
  { id: "conflicts", name: "Active Conflicts", color: "#B22222", active: true, count: 12 },
  { id: "military", name: "Military Positions", color: "#FFBF00", active: true, count: 28 },
  { id: "assets", name: "Strategic Assets", color: "#6B7B4C", active: false, count: 45 },
  { id: "resources", name: "Resource Corridors", color: "#C2B280", active: false, count: 8 },
  { id: "naval", name: "Naval Movements", color: "#4A90D9", active: false, count: 15 },
];

const mapPoints = [
  { id: 1, x: "20%", y: "30%", type: "conflict", label: "Active Zone Alpha" },
  { id: 2, x: "65%", y: "45%", type: "military", label: "Forward Operating Base" },
  { id: 3, x: "45%", y: "60%", type: "asset", label: "Strategic Installation" },
  { id: 4, x: "80%", y: "25%", type: "resource", label: "Supply Corridor" },
  { id: 5, x: "35%", y: "75%", type: "naval", label: "Naval Patrol Zone" },
];

export default function SituationRoomPage() {
  const [activeLayers, setActiveLayers] = useState(
    mapLayers.filter((l) => l.active).map((l) => l.id)
  );
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId]
    );
  };

  return (
    <div className="min-h-screen bg-midnight-900">
      {/* Header */}
      <section className="border-b border-midnight-700 bg-midnight-800 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-tactical-red/10">
                <Map className="h-6 w-6 text-tactical-red" />
                <motion.div
                  className="absolute inset-0 rounded-lg border border-tactical-red/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-slate-light">
                  Situation Room
                </h1>
                <p className="text-slate-dark">Interactive intelligence mapping</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-tactical-red"
              />
              <span className="font-mono text-xs uppercase text-tactical-red">Live Feed Active</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar - Layer Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-midnight-600 bg-midnight-800 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-tactical-amber" />
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
                  Map Layers
                </h3>
              </div>
              <div className="space-y-2">
                {mapLayers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3 transition-all ${
                      activeLayers.includes(layer.id)
                        ? "border-midnight-500 bg-midnight-700"
                        : "border-midnight-700 bg-midnight-800 opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="font-heading text-xs uppercase tracking-wider text-slate-light">
                        {layer.name}
                      </span>
                    </div>
                    <span className="rounded bg-midnight-600 px-2 py-0.5 font-mono text-[10px] text-slate-dark">
                      {layer.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Info Panel */}
            {selectedPoint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-tactical-red/30 bg-midnight-800 p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-tactical-red" />
                  <span className="font-heading text-xs font-bold uppercase tracking-wider text-tactical-red">
                    Selected Point
                  </span>
                </div>
                <h4 className="mb-2 font-heading text-sm font-bold uppercase text-slate-light">
                  {mapPoints.find((p) => p.id === selectedPoint)?.label}
                </h4>
                <p className="text-xs text-slate-dark">
                  Click for detailed intelligence report on this location.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Map Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-3"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-midnight-600 bg-midnight-800">
              {/* Grid Background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(30, 64, 175, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(30, 64, 175, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: "50px 50px",
                }}
              />

              {/* Radar Sweep */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, rgba(30, 64, 175, 0.15) 30deg, transparent 60deg)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Map Points */}
              {mapPoints.map((point) => (
                <motion.button
                  key={point.id}
                  className="absolute z-10"
                  style={{ left: point.x, top: point.y }}
                  onClick={() => setSelectedPoint(point.id)}
                  whileHover={{ scale: 1.2 }}
                >
                  <motion.div
                    className={`relative h-4 w-4 rounded-full ${
                      selectedPoint === point.id ? "bg-tactical-amber" : "bg-tactical-red"
                    }`}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="absolute inset-0 animate-ping rounded-full bg-tactical-red opacity-50" />
                  </motion.div>
                </motion.button>
              ))}

              {/* Connection Lines */}
              <svg className="absolute inset-0 h-full w-full">
                <line
                  x1="20%"
                  y1="30%"
                  x2="65%"
                  y2="45%"
                  stroke="rgba(30, 64, 175, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <line
                  x1="65%"
                  y1="45%"
                  x2="45%"
                  y2="60%"
                  stroke="rgba(212, 175, 55, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <line
                  x1="45%"
                  y1="60%"
                  x2="35%"
                  y2="75%"
                  stroke="rgba(107, 123, 76, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              </svg>

              {/* Map Controls */}
              <div className="absolute right-4 top-4 flex flex-col gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-midnight-600 bg-midnight-800 text-slate-light transition-all hover:border-tactical-red hover:text-tactical-red">
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-midnight-600 bg-midnight-800 text-slate-light transition-all hover:border-tactical-red hover:text-tactical-red">
                  <ZoomOut className="h-5 w-5" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-midnight-600 bg-midnight-800 text-slate-light transition-all hover:border-tactical-red hover:text-tactical-red">
                  <Maximize className="h-5 w-5" />
                </button>
              </div>

              {/* Status Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-midnight-600 bg-midnight-800/95 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-tactical-red" />
                  <span className="font-mono text-xs text-slate-light">LIVE TACTICAL FEED</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-mono text-xs text-slate-dark">
                    LAT: 33.8938° N
                  </span>
                  <span className="font-mono text-xs text-slate-dark">
                    LON: 35.5018° E
                  </span>
                  <span className="font-mono text-xs text-slate-dark">
                    ZOOM: 100%
                  </span>
                </div>
              </div>

              {/* Corner Markers */}
              <div className="absolute left-2 top-2 h-8 w-8 border-l-2 border-t-2 border-tactical-red/50" />
              <div className="absolute right-2 top-2 h-8 w-8 border-r-2 border-t-2 border-tactical-red/50" />
              <div className="absolute bottom-2 left-2 h-8 w-8 border-b-2 border-l-2 border-tactical-red/50" />
              <div className="absolute bottom-2 right-2 h-8 w-8 border-b-2 border-r-2 border-tactical-red/50" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
