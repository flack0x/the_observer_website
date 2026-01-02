"use client";

import { motion } from "framer-motion";
import { Send, MessageCircle, Mail, Users, ArrowRight, Globe } from "lucide-react";

export default function Community() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-midnight-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-midnight-800 border border-midnight-600 mb-4">
            <Users className="h-4 w-4 text-tactical-amber" />
            <span className="text-xs font-heading font-medium uppercase tracking-wider text-slate-medium">
              Join The Network
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-light mb-3">
            Be Part of the Conversation
          </h2>
          <p className="text-slate-medium max-w-2xl mx-auto">
            Join thousands of analysts, researchers, and truth-seekers in our growing intelligence community.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Telegram English */}
          <motion.a
            href="https://t.me/observer_5"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="group bg-midnight-800 rounded-xl p-6 border border-midnight-700 hover:border-tactical-red/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-tactical-red/10">
                <Send className="h-6 w-6 text-tactical-red" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-dark group-hover:text-tactical-red group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-light mb-2">
              Telegram (English)
            </h3>
            <p className="text-sm text-slate-medium mb-4">
              Real-time updates, breaking news, and community discussions in English.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-dark">
              <Users className="h-4 w-4" />
              <span>50K+ members</span>
            </div>
          </motion.a>

          {/* Telegram Arabic */}
          <motion.a
            href="https://t.me/almuraqb"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group bg-midnight-800 rounded-xl p-6 border border-midnight-700 hover:border-tactical-amber/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-tactical-amber/10">
                <Globe className="h-6 w-6 text-tactical-amber" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-dark group-hover:text-tactical-amber group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-light mb-2">
              Telegram (العربية)
            </h3>
            <p className="text-sm text-slate-medium mb-4">
              التحديثات والأخبار العاجلة والنقاشات المجتمعية باللغة العربية.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-dark">
              <Users className="h-4 w-4" />
              <span>30K+ members</span>
            </div>
          </motion.a>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-midnight-800 rounded-xl p-6 border border-midnight-700 sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-earth-olive/10">
                <Mail className="h-6 w-6 text-earth-olive" />
              </div>
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-light mb-2">
              Contact Us
            </h3>
            <p className="text-sm text-slate-medium mb-4">
              Have a tip, question, or want to collaborate? Reach out to our team.
            </p>
            <a
              href="mailto:contact@theobserver.com"
              className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-wider text-earth-olive hover:text-tactical-amber transition-colors"
            >
              <Mail className="h-4 w-4" />
              contact@theobserver.com
            </a>
          </motion.div>
        </div>

        {/* Discussion Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 sm:mt-12 bg-midnight-800 rounded-xl p-6 sm:p-8 border border-midnight-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="h-5 w-5 text-tactical-red" />
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
              Community Pulse
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Discussion topics */}
            {[
              {
                topic: "Gaza Situation Updates",
                activity: "Very Active",
                color: "tactical-red",
              },
              {
                topic: "Regional Analysis",
                activity: "Active",
                color: "tactical-amber",
              },
              {
                topic: "Economic Developments",
                activity: "Trending",
                color: "earth-olive",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-midnight-900 border border-midnight-700"
              >
                <span className="text-sm text-slate-light font-medium">
                  {item.topic}
                </span>
                <span className={`text-xs font-heading font-medium uppercase px-2 py-1 rounded-full bg-${item.color}/10 text-${item.color}`}>
                  {item.activity}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-midnight-700 text-center">
            <a
              href="https://t.me/observer_5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tactical-red text-white font-heading text-sm font-bold uppercase tracking-wider hover:bg-tactical-red-hover transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Join the Discussion
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
