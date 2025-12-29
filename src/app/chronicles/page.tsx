"use client";

import { motion } from "framer-motion";
import { Clock, ArrowRight, Calendar, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";

const timeline = [
  {
    year: "2024",
    events: [
      {
        month: "October",
        title: "Major Regional Escalation",
        description: "Unprecedented military operations mark significant shift in regional dynamics",
        significance: "Critical",
        category: "Military",
      },
      {
        month: "September",
        title: "Economic Realignment Summit",
        description: "Key regional powers convene to discuss alternative financial frameworks",
        significance: "High",
        category: "Economic",
      },
      {
        month: "July",
        title: "Strategic Defense Agreement",
        description: "Formalization of mutual defense pact between allied parties",
        significance: "Critical",
        category: "Diplomatic",
      },
    ],
  },
  {
    year: "2023",
    events: [
      {
        month: "December",
        title: "Alliance Formation Announced",
        description: "Historic declaration of strategic partnership reshapes regional balance",
        significance: "Critical",
        category: "Diplomatic",
      },
      {
        month: "August",
        title: "Resource Corridor Agreement",
        description: "New trade routes bypass traditional chokepoints",
        significance: "High",
        category: "Economic",
      },
      {
        month: "March",
        title: "Advanced Systems Deployment",
        description: "New defense capabilities alter strategic calculus",
        significance: "High",
        category: "Military",
      },
    ],
  },
  {
    year: "2022",
    events: [
      {
        month: "February",
        title: "Global Order Disruption",
        description: "Major geopolitical shift accelerates multipolar transition",
        significance: "Critical",
        category: "Geopolitical",
      },
      {
        month: "January",
        title: "Regional Realignment Begins",
        description: "Traditional alliances face pressure as new partnerships emerge",
        significance: "High",
        category: "Diplomatic",
      },
    ],
  },
  {
    year: "2020",
    events: [
      {
        month: "January",
        title: "Strategic Figure Eliminated",
        description: "Targeted operation removes key regional commander",
        significance: "Critical",
        category: "Military",
      },
    ],
  },
];

const getSignificanceColor = (significance: string) => {
  return significance === "Critical"
    ? "bg-tactical-red text-tactical-red border-tactical-red/30"
    : "bg-tactical-amber text-tactical-amber border-tactical-amber/30";
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Military":
      return "bg-tactical-red/20 text-tactical-red";
    case "Economic":
      return "bg-tactical-amber/20 text-tactical-amber";
    case "Diplomatic":
      return "bg-earth-olive/20 text-earth-olive";
    default:
      return "bg-earth-sand/20 text-earth-sand";
  }
};

export default function ChroniclesPage() {
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-earth-sand/10">
                <Clock className="h-6 w-6 text-earth-sand" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-slate-light">
                  Chronicles of the Axis
                </h1>
                <p className="text-slate-dark">Historical timeline and contextual analysis</p>
              </div>
            </div>
            <p className="mt-6 max-w-3xl font-body text-lg leading-relaxed text-slate-medium">
              Understanding today&apos;s conflicts requires understanding their roots. Our
              chronicles link current events to historical milestones, providing the
              essential context for comprehensive geopolitical analysis.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-tactical-red via-tactical-amber to-earth-sand lg:left-1/2 lg:-ml-px" />

            {/* Timeline Events */}
            <div className="space-y-12">
              {timeline.map((yearGroup, yearIndex) => (
                <div key={yearGroup.year}>
                  {/* Year Marker */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative mb-8 flex items-center lg:justify-center"
                  >
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-tactical-red bg-midnight-900">
                      <span className="font-heading text-lg font-bold text-tactical-red">
                        {yearGroup.year}
                      </span>
                    </div>
                  </motion.div>

                  {/* Events */}
                  <div className="space-y-6">
                    {yearGroup.events.map((event, eventIndex) => (
                      <motion.div
                        key={event.title}
                        initial={{ opacity: 0, x: eventIndex % 2 === 0 ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: eventIndex * 0.1 }}
                        className={`relative flex ${
                          eventIndex % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                        }`}
                      >
                        {/* Connector */}
                        <div className="absolute left-8 top-6 h-0.5 w-8 bg-midnight-600 lg:left-1/2 lg:w-12 lg:-translate-x-1/2" />

                        {/* Event Card */}
                        <div className="ml-20 lg:ml-0 lg:w-[calc(50%-3rem)]">
                          <article className="group rounded-xl border border-midnight-600 bg-midnight-800 p-5 transition-all hover:border-earth-sand">
                            <div className="mb-3 flex items-center gap-3">
                              <span className="font-mono text-xs text-slate-dark">{event.month}</span>
                              <span
                                className={`rounded px-2 py-0.5 font-heading text-[10px] font-bold uppercase ${getCategoryColor(
                                  event.category
                                )}`}
                              >
                                {event.category}
                              </span>
                              <span
                                className={`rounded border px-2 py-0.5 font-heading text-[10px] font-bold uppercase ${
                                  getSignificanceColor(event.significance).split(" ")[0]
                                }/10 ${getSignificanceColor(event.significance).split(" ")[1]}`}
                              >
                                {event.significance}
                              </span>
                            </div>
                            <h3 className="mb-2 font-heading text-lg font-bold uppercase tracking-wider text-slate-light transition-colors group-hover:text-earth-sand">
                              {event.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-dark">
                              {event.description}
                            </p>
                            <div className="mt-4 border-t border-midnight-700 pt-3">
                              <Link
                                href={`/chronicles/${yearGroup.year}/${event.title.toLowerCase().replace(/\s+/g, "-")}`}
                                className="flex items-center gap-1 font-heading text-xs font-medium uppercase tracking-wider text-earth-sand transition-colors hover:text-tactical-amber"
                              >
                                Full Context
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </article>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline Start */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="relative mt-12 flex lg:justify-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-slate-dark bg-midnight-900">
                <span className="font-heading text-xs text-slate-dark">...</span>
              </div>
            </motion.div>
          </div>

          {/* Load More */}
          <div className="mt-12 flex justify-center">
            <button className="flex items-center gap-2 rounded-lg border border-earth-sand bg-earth-sand/10 px-8 py-3 font-heading text-sm font-medium uppercase tracking-wider text-earth-sand transition-all hover:bg-earth-sand hover:text-midnight-900">
              Load Earlier Events
              <ChevronRight className="h-4 w-4 rotate-90" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
