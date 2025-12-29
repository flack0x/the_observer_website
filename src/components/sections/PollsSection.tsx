"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Vote, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

const activePoll = {
  question: "Which development poses the greatest threat to regional sovereignty in 2025?",
  options: [
    { id: 1, text: "Economic dependency deals (Egypt-Israel gas)", votes: 423 },
    { id: 2, text: "AI-enabled military operations", votes: 387 },
    { id: 3, text: "Disarmament of resistance forces", votes: 298 },
    { id: 4, text: "Western media narrative control", votes: 192 },
  ],
  totalVotes: 1300,
  endsIn: "3 days",
};

export default function PollsSection() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (selectedOption) {
      setHasVoted(true);
    }
  };

  const getPercentage = (votes: number) => {
    return Math.round((votes / activePoll.totalVotes) * 100);
  };

  return (
    <section className="border-t border-midnight-700 bg-midnight-900 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-5 sm:mb-6 flex items-center gap-3 sm:gap-4">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-tactical-red/10">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-tactical-red" />
              </div>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-light">
                  The Pulse
                </h2>
                <p className="text-xs sm:text-sm text-slate-dark">Community intelligence polling</p>
              </div>
            </div>

            <p className="mb-6 sm:mb-8 font-body text-base sm:text-lg leading-relaxed text-slate-medium">
              Join thousands of analysts and observers in gauging sentiment on
              critical geopolitical developments. Your perspective matters in
              understanding the collective assessment of our intelligence community.
            </p>

            {/* Stats */}
            <div className="mb-6 sm:mb-8 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-lg border border-midnight-600 bg-midnight-800 p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-tactical-amber" />
                  <span className="font-heading text-xl sm:text-2xl font-bold text-slate-light">
                    {activePoll.totalVotes.toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-dark">Active Participants</span>
              </div>
              <div className="rounded-lg border border-midnight-600 bg-midnight-800 p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Vote className="h-3 w-3 sm:h-4 sm:w-4 text-earth-olive" />
                  <span className="font-heading text-xl sm:text-2xl font-bold text-slate-light">
                    {activePoll.endsIn}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-dark">Until Poll Closes</span>
              </div>
            </div>

            <Link
              href="/polls"
              className="group inline-flex items-center gap-2 font-heading text-xs sm:text-sm font-medium uppercase tracking-wider text-tactical-red transition-colors hover:text-tactical-amber"
            >
              View All Polls
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Poll Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-midnight-600 bg-midnight-800 p-4 sm:p-6"
          >
            <div className="mb-4 sm:mb-6">
              <span className="mb-2 inline-block rounded bg-tactical-red/20 px-2 py-1 font-heading text-[10px] font-bold uppercase text-tactical-red">
                Active Poll
              </span>
              <h3 className="font-heading text-base sm:text-lg font-bold uppercase leading-snug tracking-wider text-slate-light">
                {activePoll.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {activePoll.options.map((option) => {
                const percentage = getPercentage(option.votes);
                const isSelected = selectedOption === option.id;

                return (
                  <motion.button
                    key={option.id}
                    onClick={() => !hasVoted && setSelectedOption(option.id)}
                    disabled={hasVoted}
                    className={`relative w-full overflow-hidden rounded-lg border p-4 text-left transition-all ${
                      isSelected
                        ? "border-tactical-red bg-tactical-red/10"
                        : "border-midnight-600 bg-midnight-700 hover:border-midnight-500"
                    } ${hasVoted ? "cursor-default" : "cursor-pointer"}`}
                    whileHover={!hasVoted ? { scale: 1.01 } : {}}
                    whileTap={!hasVoted ? { scale: 0.99 } : {}}
                  >
                    {/* Progress Bar (shown after voting) */}
                    {hasVoted && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 bg-tactical-red/20"
                      />
                    )}

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className={`flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full border-2 shrink-0 ${
                            isSelected
                              ? "border-tactical-red bg-tactical-red"
                              : "border-slate-dark"
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white"
                            />
                          )}
                        </div>
                        <span className="font-body text-xs sm:text-sm text-slate-light">
                          {option.text}
                        </span>
                      </div>
                      {hasVoted && (
                        <span className="font-mono text-xs sm:text-sm font-bold text-tactical-red ml-2">
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Vote Button */}
            {!hasVoted && (
              <motion.button
                onClick={handleVote}
                disabled={!selectedOption}
                className={`mt-6 w-full rounded-lg py-3 font-heading text-sm font-bold uppercase tracking-wider transition-all ${
                  selectedOption
                    ? "bg-tactical-red text-white hover:bg-tactical-red-hover"
                    : "cursor-not-allowed bg-midnight-600 text-slate-dark"
                }`}
                whileHover={selectedOption ? { scale: 1.02 } : {}}
                whileTap={selectedOption ? { scale: 0.98 } : {}}
              >
                Cast Your Vote
              </motion.button>
            )}

            {hasVoted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-lg bg-earth-olive/10 p-4 text-center"
              >
                <span className="font-heading text-sm uppercase tracking-wider text-earth-olive">
                  Vote Recorded - Thank you for participating
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
