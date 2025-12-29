"use client";

import { motion } from "framer-motion";
import { Eye, ArrowRight, MessageSquareWarning, Scale, Newspaper } from "lucide-react";
import Link from "next/link";

const analyses = [
  {
    id: 1,
    headline: "'Israel defends itself against Iranian proxies'",
    reality: "Analysis reveals systematic targeting of civilian infrastructure and AI-driven mass casualty operations in Gaza",
    mediaSource: "CNN / BBC / NYT",
    topic: "Gaza Military Operations",
    discrepancy: "Corporate media omits AI targeting systems and civilian death algorithms",
  },
  {
    id: 2,
    headline: "'Historic peace deal brings stability to region'",
    reality: "Egypt-Israel gas deal creates $35B dependency, finances occupation while providing minimal Egyptian benefit",
    mediaSource: "State Department Briefing",
    topic: "Egypt-Israel Gas Agreement",
    discrepancy: "Economic imperialism framed as 'cooperation'",
  },
];

export default function CounterNarrativePreview() {
  return (
    <section className="border-t border-midnight-700 bg-midnight-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tactical-amber/10">
              <MessageSquareWarning className="h-5 w-5 text-tactical-amber" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
                Counter-Narrative
              </h2>
              <p className="text-sm text-slate-dark">Media critique & fact analysis</p>
            </div>
          </div>
          <Link
            href="/counter-narrative"
            className="group flex items-center gap-2 font-heading text-sm font-medium uppercase tracking-wider text-tactical-amber transition-colors hover:text-tactical-red"
          >
            All Analyses
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Intro Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 max-w-3xl"
        >
          <p className="font-body text-lg leading-relaxed text-slate-medium">
            Deconstructing how mainstream media covers regional events versus the
            documented reality on the ground. We analyze framing, omissions, and
            provide sourced counter-perspectives.
          </p>
        </motion.div>

        {/* Analysis Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {analyses.map((analysis, index) => (
            <motion.article
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group overflow-hidden rounded-xl border border-midnight-600 bg-midnight-800"
            >
              {/* Header */}
              <div className="border-b border-midnight-700 bg-midnight-700 px-6 py-4">
                <div className="flex items-center gap-2 text-xs text-slate-dark">
                  <Newspaper className="h-3 w-3" />
                  <span>{analysis.mediaSource}</span>
                  <span className="mx-2">|</span>
                  <span>{analysis.topic}</span>
                </div>
              </div>

              {/* Comparison */}
              <div className="grid divide-y divide-midnight-700 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                {/* Media Narrative */}
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-tactical-red" />
                    <span className="font-heading text-xs uppercase tracking-wider text-tactical-red">
                      Media Narrative
                    </span>
                  </div>
                  <p className="font-body text-sm leading-relaxed text-slate-medium">
                    {analysis.headline}
                  </p>
                </div>

                {/* Reality */}
                <div className="bg-midnight-700/30 p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-earth-olive" />
                    <span className="font-heading text-xs uppercase tracking-wider text-earth-olive">
                      Ground Reality
                    </span>
                  </div>
                  <p className="font-body text-sm leading-relaxed text-slate-medium">
                    {analysis.reality}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-midnight-700 bg-midnight-700/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-tactical-amber" />
                  <span className="text-xs text-slate-dark">{analysis.discrepancy}</span>
                </div>
                <Link
                  href={`/counter-narrative/${analysis.id}`}
                  className="flex items-center gap-1 font-heading text-xs font-medium uppercase tracking-wider text-tactical-amber transition-colors hover:text-tactical-red"
                >
                  Full Analysis
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-xl border border-tactical-amber/20 bg-tactical-amber/5 p-8 text-center"
        >
          <Eye className="mx-auto mb-4 h-8 w-8 text-tactical-amber" />
          <h4 className="mb-2 font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
            Question Everything
          </h4>
          <p className="mx-auto max-w-2xl text-sm text-slate-medium">
            Our mission is not to replace one narrative with another, but to provide
            the documented evidence and context necessary for informed analysis.
            The truth is rarely simple.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
