"use client";

import { motion } from "framer-motion";
import { Clock, ArrowRight, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

const timelineEvents = [
  {
    year: "2025",
    events: [
      { month: "Dec", title: "Trump Grants Israel Golan 'Sovereignty'", significance: "Critical" },
      { month: "Dec", title: "Egypt-Israel $35B Gas Deal Signed", significance: "Critical" },
    ],
  },
  {
    year: "2024",
    events: [
      { month: "Oct", title: "Gaza AI Targeting Systems Exposed", significance: "Critical" },
      { month: "Jul", title: "Houthi Red Sea Operations Escalate", significance: "High" },
    ],
  },
  {
    year: "2020",
    events: [
      { month: "Jan", title: "Soleimani & Al-Muhandis Assassinated", significance: "Critical" },
      { month: "Jan", title: "Iraqi Parliament Votes for US Withdrawal", significance: "High" },
    ],
  },
];

const getSignificanceColor = (significance: string) => {
  return significance === "Critical"
    ? "bg-tactical-red text-tactical-red"
    : "bg-tactical-amber text-tactical-amber";
};

export default function ChroniclesPreview() {
  return (
    <section className="border-t border-midnight-700 bg-midnight-800 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-earth-sand/10">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-earth-sand" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-light">
                Chronicles of the Axis
              </h2>
              <p className="text-xs sm:text-sm text-slate-dark">Historical context & timeline</p>
            </div>
          </div>
          <Link
            href="/chronicles"
            className="group flex items-center gap-2 font-heading text-xs sm:text-sm font-medium uppercase tracking-wider text-earth-sand transition-colors hover:text-tactical-amber"
          >
            Full Timeline
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 sm:mb-10 max-w-3xl font-body text-base sm:text-lg leading-relaxed text-slate-medium"
        >
          Understanding today&apos;s conflicts requires understanding their roots. Our
          chronicles link current events to historical milestones, providing the
          context essential for comprehensive analysis.
        </motion.p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-tactical-red via-tactical-amber to-earth-sand lg:left-1/2" />

          {/* Events */}
          <div className="space-y-8">
            {timelineEvents.map((yearGroup, yearIndex) => (
              <motion.div
                key={yearGroup.year}
                initial={{ opacity: 0, x: yearIndex % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: yearIndex * 0.1 }}
              >
                {/* Year Marker */}
                <div className="relative mb-4 flex items-center gap-4 lg:justify-center">
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-tactical-red bg-midnight-900">
                    <Calendar className="h-4 w-4 text-tactical-red" />
                  </div>
                  <span className="font-heading text-2xl font-bold text-tactical-red lg:absolute lg:left-[calc(50%+3rem)]">
                    {yearGroup.year}
                  </span>
                </div>

                {/* Events Grid */}
                <div className="ml-12 grid gap-4 lg:ml-0 lg:grid-cols-2 lg:gap-8">
                  {yearGroup.events.map((event, eventIndex) => (
                    <motion.div
                      key={event.title}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: eventIndex * 0.1 }}
                      className={`group rounded-lg border border-midnight-600 bg-midnight-700 p-4 transition-all hover:border-midnight-500 ${
                        eventIndex % 2 === 0 ? "lg:text-right" : ""
                      }`}
                    >
                      <div
                        className={`mb-2 flex items-center gap-2 ${
                          eventIndex % 2 === 0 ? "lg:flex-row-reverse" : ""
                        }`}
                      >
                        <span className="font-mono text-xs text-slate-dark">{event.month}</span>
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            getSignificanceColor(event.significance).split(" ")[0]
                          }`}
                        />
                        <span
                          className={`font-heading text-[10px] uppercase tracking-wider ${
                            getSignificanceColor(event.significance).split(" ")[1]
                          }`}
                        >
                          {event.significance}
                        </span>
                      </div>
                      <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light transition-colors group-hover:text-tactical-amber">
                        {event.title}
                      </h4>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-12 flex justify-center"
        >
          <Link
            href="/chronicles"
            className="group flex items-center gap-2 rounded-lg border border-earth-sand bg-earth-sand/10 px-4 py-2.5 sm:px-6 sm:py-3 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-sand transition-all hover:bg-earth-sand hover:text-midnight-900"
          >
            Explore Full Historical Timeline
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
