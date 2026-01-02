"use client";

import { motion } from "framer-motion";
import { Eye, ChevronDown, Target, Shield, Radio } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-midnight-900">
      {/* Observer Silhouette Background - Positioned behind main text */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-1/2 -translate-x-1/2 top-[10%] w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] lg:w-[700px] lg:h-[700px]">
          <Image
            src="/images/observer-silhouette.png"
            alt=""
            fill
            className="object-contain object-top opacity-[0.10] lg:opacity-[0.12]"
            priority
          />
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(27, 58, 87, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(27, 58, 87, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Radial Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-tactical-red/5 via-transparent to-midnight-900" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          {/* Status Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex items-center gap-2 rounded-full border border-tactical-red/30 bg-midnight-800/50 px-4 py-2 backdrop-blur-sm"
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-tactical-red"
            />
            <span className="font-heading text-xs font-medium uppercase tracking-widest text-tactical-red">
              Live Intelligence Feed Active
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading text-[2.5rem] font-black uppercase tracking-tight text-slate-light sm:text-6xl lg:text-7xl"
          >
            <span className="block">Observe.</span>
            <span className="block text-gradient">Analyze.</span>
            <span className="block">Understand.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 sm:mt-8 max-w-2xl px-2 font-body text-base leading-relaxed text-slate-medium sm:text-xl"
          >
            Independent geopolitical intelligence and strategic analysis.
            Cutting through the noise to reveal the truth behind global
            conflicts and power dynamics.
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 w-full border-y border-midnight-600 py-6"
          >
            <div className="flex flex-row items-center justify-center gap-4 sm:gap-8">
              <div className="flex flex-col items-center text-center">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-tactical-red mb-1" />
                <div className="font-heading text-lg sm:text-2xl font-bold text-slate-light">500+</div>
                <div className="text-[9px] sm:text-xs uppercase tracking-wider text-slate-dark">
                  Intel Reports
                </div>
              </div>
              <div className="h-12 w-px bg-midnight-600" />
              <div className="flex flex-col items-center text-center">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-tactical-amber mb-1" />
                <div className="font-heading text-lg sm:text-2xl font-bold text-slate-light">50K+</div>
                <div className="text-[9px] sm:text-xs uppercase tracking-wider text-slate-dark">
                  Network
                </div>
              </div>
              <div className="h-12 w-px bg-midnight-600" />
              <div className="flex flex-col items-center text-center">
                <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-earth-olive mb-1" />
                <div className="font-heading text-lg sm:text-2xl font-bold text-slate-light">24/7</div>
                <div className="text-[9px] sm:text-xs uppercase tracking-wider text-slate-dark">
                  Monitoring
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-8 sm:mt-12 flex flex-col gap-3 sm:gap-4 sm:flex-row w-full px-4 sm:px-0 sm:w-auto"
          >
            <Link
              href="/frontline"
              className="group flex items-center justify-center gap-2 rounded-lg bg-tactical-red px-6 py-3 sm:px-8 sm:py-4 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-tactical-red-hover hover:shadow-lg hover:shadow-tactical-red/20"
            >
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
              Access The Frontline
            </Link>
            <Link
              href="/situation-room"
              className="flex items-center justify-center gap-2 rounded-lg border border-midnight-500 bg-midnight-800/50 px-6 py-3 sm:px-8 sm:py-4 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-light backdrop-blur-sm transition-all hover:border-tactical-amber hover:text-tactical-amber"
            >
              Enter Situation Room
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-[10px] uppercase tracking-widest text-slate-dark">
              Scroll for Intel
            </span>
            <ChevronDown className="h-4 w-4 text-tactical-red" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
